//var/www/html/nvrs-ts-v1/src/app/types/menu.ts
// Frontend types - these represent how the data will be used in the UI
export interface MenuItem {
    item_id: number;
    item_name: string;
    item_desc: string;
    price: number;
    item_type: string;
    image_id?: number; // Frontend-specific property for image display
}
export interface MenuItemImage {
    image_id: number;
    menu_item_id: number;
    image_type: string;
    upload_date: string;
}

// If you need frontend-specific type utilities
export type MenuItemCreateInput = Omit<MenuItem, 'item_id' | 'imageUrl'>;
export type MenuItemUpdateInput = Partial<MenuItemCreateInput>;