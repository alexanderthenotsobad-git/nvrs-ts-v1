// Frontend types - these represent how the data will be used in the UI
export interface MenuItem {
    item_id: number;
    item_name: string;
    item_desc: string;
    price: number;
    item_type: string;
    imageUrl?: string; // Frontend-specific property for image display
}

// If you need frontend-specific type utilities
export type MenuItemCreateInput = Omit<MenuItem, 'item_id' | 'imageUrl'>;
export type MenuItemUpdateInput = Partial<MenuItemCreateInput>;