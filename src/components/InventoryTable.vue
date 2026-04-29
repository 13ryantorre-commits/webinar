<template>
  <v-container fluid class="custom-table-container pa-0">
    
    <v-row no-gutters class="px-2 mb-6">
      <v-col cols="12">
        <v-tabs
          v-model="localCat"
          bg-color="transparent"
          color="primary"
          grow
          class="custom-tabs"
          @update:model-value="$emit('update-category', localCat)"
        >
          <v-tab v-for="cat in categories" :key="cat" :value="cat" class="font-weight-bold text-none py-6">
            <v-icon start size="medium" class="mr-3" v-if="cat === 'Vegetables'">mdi-leaf</v-icon>
            <v-icon start size="medium" class="mr-3" v-if="cat === 'Fruits'">mdi-food-apple</v-icon>
            <v-icon start size="medium" class="mr-3" v-if="cat === 'Utensils'">mdi-silverware-fork-knife</v-icon>
            <v-icon start size="medium" class="mr-3" v-if="cat === 'Canned Goods'">mdi-archive-outline</v-icon>
            <v-icon start size="medium" class="mr-3" v-if="cat === 'Frozen Goods'">mdi-snowflake</v-icon>
            <v-icon start size="medium" class="mr-3" v-if="cat === 'Seasonings'">mdi-shaker-outline</v-icon>
            {{ cat }}
          </v-tab>
        </v-tabs>
      </v-col>
    </v-row>

    <v-card border elevation="4" class="mx-2 mb-12 rounded-lg">
      <v-table hover class="custom-table">
        <thead class="bg-grey-lighten-4">
          <tr>
            <th class="text-overline font-weight-bold py-5 px-6">Product ID</th>
            <th class="text-overline font-weight-bold py-5">Name</th>
            <th class="text-overline font-weight-bold py-5">Description</th>
            <th class="text-overline font-weight-bold py-5">Price</th>
            <th class="text-overline font-weight-bold py-5">Stock Status</th>
            <th class="text-center text-overline font-weight-bold py-5">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="index">
            <td class="font-weight-bold text-primary py-6 px-6">{{ item.pid }}</td>
            <td class="font-weight-medium py-6 text-body-1">{{ item.name }}</td>
            <td class="text-grey-darken-1 text-body-2 py-6">{{ item.description }}</td>
            <td class="font-weight-bold py-6 text-body-1">₱{{ item.price }}</td>
            <td class="py-6">
              <v-chip 
                :color="item.stock > 0 ? (item.stock < 5 ? 'warning' : 'success') : 'error'" 
                size="default" 
                variant="flat" 
                class="px-4 font-weight-bold"
              >
                {{ item.stock > 0 ? item.stock + ' in stock' : 'Out of Stock' }}
              </v-chip>
            </td>
            <td class="text-center py-6">
              <v-btn icon="mdi-pencil" variant="text" color="blue-darken-1" size="small" class="mr-2" @click="$emit('edit', item)"></v-btn>
              <v-btn icon="mdi-delete" variant="text" color="red-darken-1" size="small" class="mr-2" @click="$emit('delete', item)"></v-btn>
              <v-btn 
                icon="mdi-cart-plus" 
                variant="elevated" 
                color="green-darken-1" 
                size="small" 
                :disabled="item.stock <= 0" 
                @click="$emit('add-to-cart-request', item)"
              ></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

<script>
export default {
  props: ['items', 'categories', 'selectedCategory', 'customerId'],
  data() { return { localCat: this.selectedCategory } },
  watch: { selectedCategory(newVal) { this.localCat = newVal; } }
}
</script>

<style scoped>
.custom-table-container {
  width: 98vw !important;
  max-width: none !important;
  margin: 0 auto;
}

.custom-tabs {
  border-bottom: 2px solid #f5f5f5;
}

.custom-table :deep(td) {
  height: 80px !important; /* Nilakihan natin ang row height para mas maluwag */
}

.v-table :deep(tr:not(:last-child) td) {
  border-bottom: 1px solid #eeeeee !important;
}

/* Hover row effect */
.custom-table :deep(tr:hover) {
  background-color: #fbfbfb !important;
}
</style>