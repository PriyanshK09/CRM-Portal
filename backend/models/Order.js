import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'Order ID is required'],
    unique: true,
    trim: true
  },
  customer_id: {
    type: String,
    required: [true, 'Customer ID is required'],
    trim: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  order_date: {
    type: Date,
    required: [true, 'Order date is required'],
    default: Date.now
  },
  total_amount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  items: [{
    product_id: String,
    name: String,
    quantity: Number,
    price: Number
  }],
  payment_method: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'],
    default: 'credit_card'
  },
  shipping_address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip_code: String
  },
  billing_address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip_code: String
  },
  notes: String,
  campaign_source: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }
}, {
  timestamps: true
});

// Calculate the total number of items in the order
OrderSchema.virtual('item_count').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Calculate the average item price
OrderSchema.virtual('average_item_price').get(function() {
  const totalItems = this.item_count;
  return totalItems > 0 ? this.total_amount / totalItems : 0;
});

export default mongoose.model('Order', OrderSchema);