import Link from '../models/Link.js';
import { extractMetadata } from '../utils/urlMetadata.js';

// @desc    Get all links
// @route   GET /api/links
// @access  Public
export const getLinks = async (req, res) => {
  try {
    const links = await Link.find().populate('relatedLinks', 'title url');
    res.json({
      success: true,
      count: links.length,
      data: links,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get single link
// @route   GET /api/links/:id
// @access  Public
export const getLink = async (req, res) => {
  try {
    const link = await Link.findById(req.params.id).populate('relatedLinks', 'title url');

    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Link not found',
      });
    }

    res.json({
      success: true,
      data: link,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Create new link
// @route   POST /api/links
// @access  Public
export const createLink = async (req, res) => {
  try {
    const { url, tags, category, notes, relatedLinks } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a URL',
      });
    }

    // Check if link already exists
    const existingLink = await Link.findOne({ url });
    if (existingLink) {
      return res.status(400).json({
        success: false,
        error: 'Link already exists',
      });
    }

    // Extract metadata from URL
    const metadata = await extractMetadata(url);

    // Create link with extracted metadata
    const link = await Link.create({
      url,
      title: metadata.title,
      description: metadata.description,
      favicon: metadata.favicon,
      image: metadata.image,
      tags: tags || [],
      category: category || 'Uncategorized',
      notes: notes || '',
      relatedLinks: relatedLinks || [],
    });

    res.status(201).json({
      success: true,
      data: link,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update link
// @route   PUT /api/links/:id
// @access  Public
export const updateLink = async (req, res) => {
  try {
    const { title, description, tags, category, notes, relatedLinks } = req.body;

    let link = await Link.findById(req.params.id);

    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Link not found',
      });
    }

    // Update fields
    if (title !== undefined) link.title = title;
    if (description !== undefined) link.description = description;
    if (tags !== undefined) link.tags = tags;
    if (category !== undefined) link.category = category;
    if (notes !== undefined) link.notes = notes;
    if (relatedLinks !== undefined) link.relatedLinks = relatedLinks;

    await link.save();

    res.json({
      success: true,
      data: link,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete link
// @route   DELETE /api/links/:id
// @access  Public
export const deleteLink = async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);

    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Link not found',
      });
    }

    await link.deleteOne();

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get graph data for visualization
// @route   GET /api/links/graph
// @access  Public
export const getGraphData = async (req, res) => {
  try {
    const links = await Link.find().populate('relatedLinks', '_id title url');

    // Transform data for graph visualization
    const nodes = links.map(link => ({
      id: link._id.toString(),
      label: link.title || link.url,
      url: link.url,
      category: link.category,
      tags: link.tags,
    }));

    const edges = [];
    links.forEach(link => {
      link.relatedLinks.forEach(relatedLink => {
        edges.push({
          source: link._id.toString(),
          target: relatedLink._id.toString(),
        });
      });
    });

    res.json({
      success: true,
      data: {
        nodes,
        edges,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
