<template>
  <v-app :theme="currentTheme" class="modern-font">
    
    <LoginOverlay v-if="!currentUser" @login-success="onLoginSuccess" />

    <v-main v-else>
      <v-container fluid class="pa-0">
        
        <v-row no-gutters class="mt-2 mb-1">
          <v-col cols="12" class="text-center">
            <h2 class="app-title">Berto Inventory</h2>
            <div class="text-caption text-grey text-uppercase tracking-widest">
              berts v1.0
            </div>
          </v-col>
        </v-row>

        <v-row no-gutters class="mx-auto align-center actions-row" style="width: 96vw;">
          <v-col cols="auto" class="px-2 d-flex align-center">
            <div class="session-label">
              Active Session 
              <v-chip color="primary" size="small" variant="flat" class="ml-2 session-chip">
                {{ currentUser.id }}
              </v-chip>
            </div>
            <v-btn
              :icon="currentTheme === 'light' ? 'mdi-moon-waning-crescent' : 'mdi-white-balance-sunny'"
              variant="tonal" class="ml-4 theme-toggle" @click="toggleTheme"
              :color="currentTheme === 'light' ? 'indigo-darken-2' : 'amber-lighten-1'"
              density="comfortable"
            ></v-btn>
          </v-col>

          <v-spacer></v-spacer>

          <v-col cols="auto" class="px-2 d-flex align-center" style="gap: 12px;">
            <v-btn color="orange-darken-4" prepend-icon="mdi-basket" @click="receiptDialog = true" elevation="1" class="action-btn" size="small">
              Cart ({{ cartQuantity }})
            </v-btn>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()" elevation="1" class="action-btn" size="small">
              New Product
            </v-btn>
          </v-col>
        </v-row>

        <div class="mt-1">
          <InventoryTable 
            :items="filteredItems" 
            :categories="categories" 
            :selectedCategory="selectedCategory" 
            :customerId="currentUser.id"
            @update-category="selectedCategory = $event" 
            @edit="openDialog" 
            @delete="deleteItem" 
            @add-to-cart-request="promptQty" 
          />
        </div>
      </v-container>

      <v-btn class="floating-logout" color="red-darken-2" elevation="4" size="large" @click="handleLogout" prepend-icon="mdi-logout">
        Logout
      </v-btn>
    </v-main>

    <v-dialog v-model="qtyDialog" max-width="450px" persistent>
      <v-card class="modern-dialog-card" rounded="xl" elevation="12">
        <v-sheet color="indigo-darken-3" class="pa-6 text-center text-white">
          <v-icon size="40" class="mb-2">mdi-cart-plus</v-icon>
          <div class="text-h5 font-weight-bold">Add to Cart</div>
        </v-sheet>
        <v-card-text class="pa-8">
          <div class="text-center mb-6">
            <div class="text-h5 font-weight-black text-primary">{{ selectedItemForCart?.name }}</div>
            <v-chip size="small" variant="tonal" color="grey" class="mt-1 font-weight-bold">ID: {{ selectedItemForCart?.pid }}</v-chip>
          </div>
          <v-text-field v-model.number="selectedQty" type="number" label="Quantity" variant="filled" density="extra-comfortable" color="indigo" class="qty-input-text" persistent-hint :hint="'Available Stock: ' + selectedItemForCart?.stock"></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-btn variant="text" @click="qtyDialog = false">Cancel</v-btn>
          <v-spacer/>
          <v-btn color="indigo-darken-3" variant="elevated" size="large" @click="confirmAddToCart" class="px-10 confirm-btn text-none">Confirm Order</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialog" max-width="550px" persistent>
      <v-card class="modern-dialog-card" rounded="xl" elevation="12">
        <v-sheet color="indigo-darken-3" class="pa-6 text-center text-white">
          <v-icon size="40" class="mb-2">{{ editedIndex === -1 ? 'mdi-plus-box' : 'mdi-pencil-box' }}</v-icon>
          <div class="text-h5 font-weight-bold">{{ editedIndex === -1 ? 'New Product' : 'Edit Product' }}</div>
        </v-sheet>
        <v-card-text class="pa-8">
          <v-row>
            <v-col cols="12"><v-text-field v-model="editedItem.name" label="Product Name" variant="outlined" density="comfortable" color="indigo" hide-details class="mb-4"></v-text-field></v-col>
            <v-col cols="12"><v-text-field v-model="editedItem.description" label="Description" variant="outlined" density="comfortable" color="indigo" hide-details class="mb-4"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="editedItem.price" label="Price" type="number" variant="outlined" prefix="₱" density="comfortable" color="indigo"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="editedItem.stock" label="Stock" type="number" variant="outlined" density="comfortable" color="indigo"></v-text-field></v-col>
            <v-col cols="12"><v-select v-model="editedItem.category" :items="categories" label="Category" variant="outlined" density="comfortable" color="indigo"></v-select></v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-6">
          <v-btn variant="text" color="grey-darken-1" @click="dialog = false" class="px-6 font-weight-bold text-none">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn 
            color="indigo-darken-3" 
            variant="elevated" 
            size="large" 
            @click="saveItem" 
            class="px-10 confirm-btn text-none"
            :disabled="!editedItem.name || !editedItem.description || editedItem.price <= 0"
          >
            Save Product
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="receiptDialog" max-width="450px">
      <v-card class="modern-dialog-card" rounded="xl" elevation="12">
        <v-sheet color="indigo-darken-3" class="pa-6 text-center text-white">
          <v-icon size="40" class="mb-2">mdi-cart-check</v-icon>
          <div class="text-h5 font-weight-bold">Shopping Cart</div>
        </v-sheet>
        <v-card-text class="pa-6">
          <div v-if="cart.length === 0" class="text-center py-8 text-grey">Your cart is empty</div>
          <v-list v-else lines="two" bg-color="transparent">
            <v-list-item v-for="(item, i) in cart" :key="i" class="px-0">
              <template v-slot:prepend><v-avatar color="indigo-lighten-5" rounded="lg"><span class="text-indigo font-weight-bold">{{ item.qty }}</span></v-avatar></template>
              <v-list-item-title class="font-weight-bold text-body-1">{{ item.name }}</v-list-item-title>
              <template v-slot:append><div class="text-body-1 font-weight-black text-indigo">₱{{ item.subtotal }}</div></template>
            </v-list-item>
          </v-list>
          <v-divider v-if="cart.length > 0" class="my-4"></v-divider>
          <div v-if="cart.length > 0" class="d-flex justify-space-between align-center px-2 py-2">
            <span class="text-h6 font-weight-medium">Total Amount</span>
            <span class="text-h5 font-weight-black text-success">₱{{ cartTotal }}</span>
          </div>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-btn variant="text" color="grey-darken-1" @click="receiptDialog = false" class="px-6 font-weight-bold text-none">Close</v-btn>
          <v-spacer></v-spacer>
          <v-btn v-if="cart.length > 0" color="success" variant="elevated" size="large" @click="processBuy" class="px-10 confirm-btn text-none">Checkout</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { auth } from './auth';
import LoginOverlay from './components/LoginOverlay.vue';
import InventoryTable from './components/InventoryTable.vue';

export default {
  components: { LoginOverlay, InventoryTable },
  data: () => ({
    currentUser: auth.getUser(),
    currentTheme: 'light',
    selectedCategory: 'Vegetables',
    categories: ['Vegetables', 'Fruits', 'Utensils', 'Canned Goods', 'Frozen Goods', 'Seasonings'],
    dialog: false, receiptDialog: false, qtyDialog: false,
    selectedItemForCart: null, selectedQty: 1, editedIndex: -1,
    allItems: [], cart: [],
    editedItem: { pid: '', name: '', description: '', price: 0, stock: 0, category: 'Vegetables' }
  }),
  computed: {
    filteredItems() { return this.allItems.filter(i => i.category === this.selectedCategory); },
    cartTotal() { return this.cart.reduce((sum, item) => sum + item.subtotal, 0); },
    cartQuantity() { return this.cart.reduce((sum, item) => sum + item.qty, 0); }
  },
  created() { this.loadInventory(); },
  methods: {
    toggleTheme() { this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light'; },
    onLoginSuccess() { this.currentUser = auth.getUser(); },
    handleLogout() { auth.logout(); this.currentUser = null; this.cart = []; },
    updateProductIDs() {
      this.categories.forEach(cat => {
        const catItems = this.allItems.filter(item => item.category === cat);
        const prefix = cat.substring(0, 2).toUpperCase();
        catItems.forEach((item, index) => {
          item.pid = `${prefix}-PRD-${(index + 1).toString().padStart(3, '0')}`;
        });
      });
      this.saveInventory();
    },
    loadInventory() {
      const data = localStorage.getItem('inventory_db');
      if (data) this.allItems = JSON.parse(data);
      else {
        this.allItems = [
          { name: 'Carrots', description: 'Fresh and organic', price: 50, stock: 20, category: 'Vegetables' },
          { name: 'Apple', description: 'Imported Fuji', price: 25, stock: 50, category: 'Fruits' }
        ];
        this.updateProductIDs();
      }
    },
    saveInventory() { localStorage.setItem('inventory_db', JSON.stringify(this.allItems)); },
    openDialog(item) {
      this.editedIndex = item ? this.allItems.indexOf(item) : -1;
      this.editedItem = item ? Object.assign({}, item) : { name: '', description: '', price: 0, stock: 0, category: this.selectedCategory };
      this.dialog = true;
    },
    saveItem() {
      // Final logic-level safety check
      if (!this.editedItem.name || this.editedItem.price <= 0) return;
      
      if (this.editedIndex > -1) Object.assign(this.allItems[this.editedIndex], this.editedItem);
      else this.allItems.push({ ...this.editedItem });
      
      this.updateProductIDs();
      this.dialog = false;
    },
    deleteItem(item) {
      if (confirm('Are you sure you want to delete this product?')) {
        this.allItems.splice(this.allItems.indexOf(item), 1);
        this.updateProductIDs();
      }
    },
    promptQty(item) { this.selectedItemForCart = item; this.selectedQty = 1; this.qtyDialog = true; },
    confirmAddToCart() {
      if (this.selectedQty > this.selectedItemForCart.stock) return alert("Not enough stock!");
      const existing = this.cart.find(c => c.pid === this.selectedItemForCart.pid);
      if (existing) {
        existing.qty += this.selectedQty;
        existing.subtotal = existing.qty * existing.price;
      } else {
        this.cart.push({ ...this.selectedItemForCart, qty: this.selectedQty, subtotal: this.selectedItemForCart.price * this.selectedQty });
      }
      this.qtyDialog = false;
    },
    processBuy() {
      this.cart.forEach(c => { const p = this.allItems.find(x => x.pid === c.pid); if (p) p.stock -= c.qty; });
      this.saveInventory(); this.cart = []; this.receiptDialog = false; alert("Transaction Successful!");
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.modern-font { font-family: 'Inter', sans-serif !important; -webkit-font-smoothing: antialiased; }
.app-title { font-weight: 800; letter-spacing: -1.2px; font-size: 1.8rem; line-height: 1; }
.tracking-widest { letter-spacing: 2px !important; font-weight: 600; font-size: 0.65rem; }
.session-label { font-weight: 600; font-size: 0.75rem; color: #888; text-transform: uppercase; }
.action-btn { text-transform: none !important; font-weight: 600; border-radius: 6px; }
.actions-row { margin-top: 2px !important; margin-bottom: 8px !important; }
.floating-logout { position: fixed; bottom: 25px; right: 25px; border-radius: 10px; text-transform: none !important; font-weight: 600; }

.modern-dialog-card { overflow: hidden; }
.qty-input-text :deep(input) { font-size: 1.5rem !important; font-weight: 700 !important; text-align: center; color: #3f51b5; }
.confirm-btn { border-radius: 12px !important; font-weight: 700 !important; letter-spacing: 0.5px; }

/* Dark mode overrides for dialogs */
.v-theme--dark .modern-dialog-card { background-color: #1e1e2f !important; }
</style>