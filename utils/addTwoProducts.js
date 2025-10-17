import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import ProductVariation from '../models/ProductVariation.js';
import Product from '../models/Product.js';
import QRCode from 'qrcode';

dotenv.config();

const addTwoProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Step 1: Get or create an admin user
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found. Creating one...');
      adminUser = new User({
        username: 'admin',
        email: 'admin@rispit.com',
        password: 'admin123',
        role: 'admin',
        fullName: 'System Admin',
        phone: '1234567890',
        isActive: true
      });
      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Using existing admin user:', adminUser.username);
    }

    // Step 2: Create a valid category
    console.log('\n=== Creating Category ===');
    
    const categoryName = 'Electronics';
    let category = await Category.findOne({ name: categoryName });
    
    if (!category) {
      category = new Category({
        name: categoryName,
        description: 'Electronic devices and accessories',
        color: '#FF6B6B',
        icon: 'Zap',
        isActive: true,
        sortOrder: 1,
        createdBy: adminUser._id,
        createdByName: adminUser.fullName
      });
      await category.save();
      console.log('✓ Category created:', category.name);
    } else {
      console.log('✓ Using existing category:', category.name);
    }

    // Step 3: Create valid product variations
    console.log('\n=== Creating Product Variations ===');
    
    // Create Size variation
    let sizeVariation = await ProductVariation.findOne({ name: 'Size' });
    
    if (!sizeVariation) {
      sizeVariation = new ProductVariation({
        name: 'Size',
        description: 'Product size variations',
        type: 'single',
        isRequired: true,
        isActive: true,
        sortOrder: 1,
        values: [
          {
            value: 'Small',
            priceAdjustment: 0,
            isActive: true,
            sortOrder: 1
          },
          {
            value: 'Medium',
            priceAdjustment: 50,
            isActive: true,
            sortOrder: 2
          },
          {
            value: 'Large',
            priceAdjustment: 100,
            isActive: true,
            sortOrder: 3
          }
        ],
        createdBy: adminUser._id,
        createdByName: adminUser.fullName
      });
      await sizeVariation.save();
      console.log('✓ Size variation created with values:', sizeVariation.values.map(v => v.value).join(', '));
    } else {
      console.log('✓ Using existing Size variation');
    }

    // Create Color variation
    let colorVariation = await ProductVariation.findOne({ name: 'Color' });
    
    if (!colorVariation) {
      colorVariation = new ProductVariation({
        name: 'Color',
        description: 'Product color variations',
        type: 'single',
        isRequired: true,
        isActive: true,
        sortOrder: 2,
        values: [
          {
            value: 'Black',
            priceAdjustment: 0,
            isActive: true,
            sortOrder: 1
          },
          {
            value: 'White',
            priceAdjustment: 20,
            isActive: true,
            sortOrder: 2
          },
          {
            value: 'Blue',
            priceAdjustment: 30,
            isActive: true,
            sortOrder: 3
          }
        ],
        createdBy: adminUser._id,
        createdByName: adminUser.fullName
      });
      await colorVariation.save();
      console.log('✓ Color variation created with values:', colorVariation.values.map(v => v.value).join(', '));
    } else {
      console.log('✓ Using existing Color variation');
    }

    // Step 4: Create Product 1 - Smartphone with variations
    console.log('\n=== Creating Product 1: Smartphone ===');
    
    const productName1 = 'Smartphone X';
    let product1 = await Product.findOne({ name: productName1 });
    
    if (!product1) {
      // Prepare variations array
      const variations = [
        {
          variationId: sizeVariation._id,
          variationName: sizeVariation.name,
          selectedValues: sizeVariation.values.map(v => ({
            valueId: v._id,
            value: v.value,
            priceAdjustment: v.priceAdjustment
          }))
        },
        {
          variationId: colorVariation._id,
          variationName: colorVariation.name,
          selectedValues: colorVariation.values.map(v => ({
            valueId: v._id,
            value: v.value,
            priceAdjustment: v.priceAdjustment
          }))
        }
      ];

      // Prepare variation combinations (all possible combinations)
      const variationCombinations = [];
      let comboIndex = 1;
      for (const sizeValue of sizeVariation.values) {
        for (const colorValue of colorVariation.values) {
          const combinationPrice = 500 + sizeValue.priceAdjustment + colorValue.priceAdjustment;
          variationCombinations.push({
            sku: `SMPH-X-001-V${comboIndex}`,
            combinationName: `${sizeValue.value} / ${colorValue.value}`,
            variations: [
              {
                variationName: 'Size',
                selectedValue: sizeValue.value
              },
              {
                variationName: 'Color',
                selectedValue: colorValue.value
              }
            ],
            purchasePrice: combinationPrice * 0.6, // 60% of selling price
            sellingPrice: combinationPrice,
            stock: Math.floor(Math.random() * 50) + 10, // Random stock between 10-60
            minStock: 5,
            isActive: true
          });
          comboIndex++;
        }
      }

      product1 = new Product({
        name: productName1,
        sku: 'SMPH-X-001',
        category: category.name,
        description: 'Latest smartphone with advanced features',
        purchasePrice: 300,
        sellingPrice: 500,
        stock: 0, // Main product stock is 0 when using variations
        minStock: 5,
        hasVariations: true,
        variations: variations,
        variationCombinations: variationCombinations,
        isActive: true,
        taxRate: 18,
        unit: 'piece'
      });

      // Generate QR code for main product
      const mainQrCodeData = JSON.stringify({
        id: product1._id,
        name: product1.name,
        sku: product1.sku,
        hasVariations: product1.hasVariations
      });
      product1.qrCode = await QRCode.toDataURL(mainQrCodeData);

      await product1.save();

      // Generate QR codes for variation combinations
      for (let i = 0; i < product1.variationCombinations.length; i++) {
        const combination = product1.variationCombinations[i];
        const combinationQRData = JSON.stringify({
          productId: product1._id,
          combinationSku: combination.sku,
          name: `${product1.name} - ${combination.combinationName}`,
          price: combination.sellingPrice
        });
        combination.qrCode = await QRCode.toDataURL(combinationQRData);
      }

      await product1.save();
      
      console.log('✓ Product 1 created:', product1.name);
      console.log('  - SKU:', product1.sku);
      console.log('  - Category:', product1.category);
      console.log('  - Variations:', product1.variations.length);
      console.log('  - Variation Combinations:', product1.variationCombinations.length);
      console.log('  - Combination Details:');
      product1.variationCombinations.forEach(combo => {
        console.log(`    • ${combo.combinationName}: ₹${combo.sellingPrice}, Stock: ${combo.stock}, SKU: ${combo.sku}`);
      });
    } else {
      console.log('✓ Product 1 already exists:', product1.name);
    }

    // Step 5: Create Product 2 - Laptop with variations
    console.log('\n=== Creating Product 2: Laptop ===');
    
    const productName2 = 'Gaming Laptop Pro';
    let product2 = await Product.findOne({ name: productName2 });
    
    if (!product2) {
      // For this product, we'll use just Size variation
      const variations = [
        {
          variationId: sizeVariation._id,
          variationName: sizeVariation.name,
          selectedValues: sizeVariation.values.slice(1).map(v => ({ // Using Medium and Large only
            valueId: v._id,
            value: v.value,
            priceAdjustment: v.priceAdjustment
          }))
        },
        {
          variationId: colorVariation._id,
          variationName: colorVariation.name,
          selectedValues: [colorVariation.values[0], colorVariation.values[2]].map(v => ({ // Black and Blue only
            valueId: v._id,
            value: v.value,
            priceAdjustment: v.priceAdjustment
          }))
        }
      ];

      // Prepare variation combinations (selected combinations only)
      const variationCombinations = [];
      const selectedSizes = sizeVariation.values.slice(1); // Medium and Large
      const selectedColors = [colorVariation.values[0], colorVariation.values[2]]; // Black and Blue
      
      let comboIndex = 1;
      for (const sizeValue of selectedSizes) {
        for (const colorValue of selectedColors) {
          const combinationPrice = 1500 + sizeValue.priceAdjustment + colorValue.priceAdjustment;
          variationCombinations.push({
            sku: `LPTP-GP-002-V${comboIndex}`,
            combinationName: `${sizeValue.value} / ${colorValue.value}`,
            variations: [
              {
                variationName: 'Size',
                selectedValue: sizeValue.value
              },
              {
                variationName: 'Color',
                selectedValue: colorValue.value
              }
            ],
            purchasePrice: combinationPrice * 0.7, // 70% of selling price
            sellingPrice: combinationPrice,
            stock: Math.floor(Math.random() * 30) + 5, // Random stock between 5-35
            minStock: 3,
            isActive: true
          });
          comboIndex++;
        }
      }

      product2 = new Product({
        name: productName2,
        sku: 'LPTP-GP-002',
        category: category.name,
        description: 'High-performance gaming laptop with RGB keyboard',
        purchasePrice: 1050,
        sellingPrice: 1500,
        stock: 0, // Main product stock is 0 when using variations
        minStock: 3,
        hasVariations: true,
        variations: variations,
        variationCombinations: variationCombinations,
        isActive: true,
        taxRate: 18,
        unit: 'piece'
      });

      // Generate QR code for main product
      const mainQrCodeData = JSON.stringify({
        id: product2._id,
        name: product2.name,
        sku: product2.sku,
        hasVariations: product2.hasVariations
      });
      product2.qrCode = await QRCode.toDataURL(mainQrCodeData);

      await product2.save();

      // Generate QR codes for variation combinations
      for (let i = 0; i < product2.variationCombinations.length; i++) {
        const combination = product2.variationCombinations[i];
        const combinationQRData = JSON.stringify({
          productId: product2._id,
          combinationSku: combination.sku,
          name: `${product2.name} - ${combination.combinationName}`,
          price: combination.sellingPrice
        });
        combination.qrCode = await QRCode.toDataURL(combinationQRData);
      }

      await product2.save();
      
      console.log('✓ Product 2 created:', product2.name);
      console.log('  - SKU:', product2.sku);
      console.log('  - Category:', product2.category);
      console.log('  - Variations:', product2.variations.length);
      console.log('  - Variation Combinations:', product2.variationCombinations.length);
      console.log('  - Combination Details:');
      product2.variationCombinations.forEach(combo => {
        console.log(`    • ${combo.combinationName}: ₹${combo.sellingPrice}, Stock: ${combo.stock}, SKU: ${combo.sku}`);
      });
    } else {
      console.log('✓ Product 2 already exists:', product2.name);
    }

    // Update category product count
    await category.updateProductCount();
    console.log('\n✓ Category product count updated:', category.productCount);

    console.log('\n=== Summary ===');
    console.log('✓ Admin User:', adminUser.username);
    console.log('✓ Category:', category.name);
    console.log('✓ Variations Created: Size, Color');
    console.log('✓ Products Created:');
    console.log('  1.', product1.name, '- SKU:', product1.sku);
    console.log('  2.', product2.name, '- SKU:', product2.sku);
    console.log('\n✅ All products created successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the script
addTwoProducts();

