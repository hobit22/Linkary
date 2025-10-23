import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  favicon: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
  }],
  category: {
    type: String,
    default: 'Uncategorized',
  },
  relatedLinks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
  }],
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
linkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Link = mongoose.model('Link', linkSchema);

export default Link;
