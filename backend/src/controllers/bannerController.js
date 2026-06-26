const prisma = require('../prismaClient');
const { ValidationError, BadRequestError } = require('../middleware/errorMiddleware');
const { uploadBuffer } = require('../utils/cloudinaryClient');

// Helper: compute effective status considering schedule/expiry
function resolveStatus(banner) {
  const now = new Date();
  if (banner.status === 'scheduled' && banner.scheduledAt && new Date(banner.scheduledAt) <= now) {
    return 'active';
  }
  if (banner.status === 'active' && banner.expiresAt && new Date(banner.expiresAt) <= now) {
    return 'archived';
  }
  return banner.status;
}

class BannerController {
  // ─── PUBLIC ──────────────────────────────────────────────────────────────────

  /**
   * Get active banners for storefront — optionally filtered by placement.
   * Automatically respects scheduledAt and expiresAt.
   * GET /api/banners?placement=promo_home
   */
  async getPublicBanners(req, res) {
    try {
      const { placement } = req.query;
      const now = new Date();

      const where = {
        OR: [
          { status: 'active' },
          {
            status: 'scheduled',
            scheduledAt: { lte: now },
          },
        ],
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } },
            ],
          },
        ],
      };

      if (placement) {
        where.placement = placement;
      }

      const banners = await prisma.banner.findMany({
        where,
        orderBy: { priority: 'asc' },
      });

      res.json(banners);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Track impression or click event (fire-and-forget, no auth needed).
   * POST /api/banners/:id/track
   * Body: { type: 'impression' | 'click' }
   */
  async trackEvent(req, res) {
    try {
      const { id } = req.params;
      const { type } = req.body;

      if (!['impression', 'click'].includes(type)) {
        throw new BadRequestError('type must be impression or click');
      }

      const field = type === 'impression' ? 'impressions' : 'clicks';

      await prisma.banner.update({
        where: { id },
        data: { [field]: { increment: 1 } },
      });

      res.status(204).send();
    } catch (error) {
      // Swallow not-found so a stale frontend ID never causes a visible error
      if (error.code === 'P2025') return res.status(204).send();
      throw error;
    }
  }

  // ─── ADMIN ────────────────────────────────────────────────────────────────────

  /**
   * Get all banners for admin (all statuses, full data).
   * GET /api/admin/banners
   */
  async getAllBanners(req, res) {
    try {
      const banners = await prisma.banner.findMany({
        orderBy: [{ placement: 'asc' }, { priority: 'asc' }, { createdAt: 'desc' }],
      });
      res.json(banners);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new banner.
   * POST /api/admin/banners
   */
  async createBanner(req, res) {
    try {
      const banner = await prisma.banner.create({ data: req.body });
      res.status(201).json(banner);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a banner.
   * PUT /api/admin/banners/:id
   */
  async updateBanner(req, res) {
    try {
      const existing = await prisma.banner.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        res.status(404);
        throw new Error('Banner not found');
      }

      const updated = await prisma.banner.update({
        where: { id: req.params.id },
        data: req.body,
      });

      res.json(updated);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a banner permanently.
   * DELETE /api/admin/banners/:id
   */
  async deleteBanner(req, res) {
    try {
      const existing = await prisma.banner.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        res.status(404);
        throw new Error('Banner not found');
      }

      await prisma.banner.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Duplicate a banner — creates a draft copy with "(نسخة)" suffix.
   * POST /api/admin/banners/:id/duplicate
   */
  async duplicateBanner(req, res) {
    try {
      const source = await prisma.banner.findUnique({ where: { id: req.params.id } });
      if (!source) {
        res.status(404);
        throw new Error('Banner not found');
      }

      // Strip DB-generated fields, create fresh copy
      const { id, createdAt, updatedAt, impressions, clicks, ...rest } = source;

      const copy = await prisma.banner.create({
        data: {
          ...rest,
          title: `${rest.title} (نسخة)`,
          status: 'draft',
          priority: rest.priority + 1,
        },
      });

      res.status(201).json(copy);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reorder banners — accepts ordered array of IDs, sets priority = index.
   * PATCH /api/admin/banners/reorder
   * Body: { ids: [uuid, uuid, ...] }
   */
  async reorderBanners(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('ids array is required');
      }

      // Verify all banners exist
      const count = await prisma.banner.count({ where: { id: { in: ids } } });
      if (count !== ids.length) {
        throw new BadRequestError('One or more banner IDs not found');
      }

      // Update priorities in a single transaction
      await prisma.$transaction(
        ids.map((id, index) =>
          prisma.banner.update({ where: { id }, data: { priority: index } })
        )
      );

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Archive a banner (soft delete — keeps analytics, removes from storefront).
   * PATCH /api/admin/banners/:id/archive
   */
  async archiveBanner(req, res) {
    try {
      const existing = await prisma.banner.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        res.status(404);
        throw new Error('Banner not found');
      }

      const updated = await prisma.banner.update({
        where: { id: req.params.id },
        data: { status: 'archived' },
      });

      res.json(updated);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload banner image to Cloudinary.
   * POST /api/admin/banners/upload-image
   */
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
      }

      const url = await uploadBuffer(req.file.buffer, 'banners');
      res.json({ url });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BannerController();
