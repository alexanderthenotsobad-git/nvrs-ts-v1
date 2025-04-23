// /var/www/html/nvrs-ts-v1/src/app/ui/components/MenuList.tsx
"use client"

import { useState, useEffect } from 'react'
import type { MenuItem } from '@/types/menu'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import ImageUpload from './ImageUpload'
import AddItemDialog from './AddItemDialog'
//import UpdateMenuItem from './UpdateMenuItem'
//import DeleteMenuItem from './DeleteMenuItem'

const MenuList = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  //const [openDialogId, setOpenDialogId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('https://api.alexanderthenotsobad.us/')
        if (!response.ok) {
          throw new Error('Failed to fetch menu items')
        }
        const data = await response.json()
        // Ensure price is properly parsed as number
        const parsedData = data.map((item: MenuItem) => ({
          ...item,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
        }))
        setMenuItems(parsedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [])

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
  }
  const RenderUpdateMenuItem = ({ item }: { item: MenuItem }) => {
    const [itemName, setItemName] = useState(item.item_name);
    const [itemDesc, setItemDesc] = useState(item.item_desc);
    const [price, setPrice] = useState(item.price.toString());
    const [itemType, setItemType] = useState(item.item_type);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        // Validate price
        const priceValue = parseFloat(price);
        if (isNaN(priceValue)) {
          throw new Error('Please enter a valid price');
        }

        const updateData = {
          item_name: itemName,
          item_desc: itemDesc,
          price: priceValue,
          item_type: itemType
        };

        const response = await fetch(`https://api.alexanderthenotsobad.us/menu/${item.item_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          throw new Error('Failed to update menu item');
        }

        // Update local state
        const updatedItem = {
          ...item,
          item_name: itemName,
          item_desc: itemDesc,
          price: priceValue,
          item_type: itemType
        };

        handleMenuItemUpdate(updatedItem);
        setIsUpdateDialogOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    return (
      <AddItemDialog
        trigger={
          <Button variant="outline" size="sm">
            Edit Item
          </Button>
        }
        title={`Edit ${item.item_name}`}
        description="Make changes to the menu item details."
        isOpen={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="itemName" className="text-sm font-medium">
              Item Name
            </label>
            <input
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="itemDesc" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="itemDesc"
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="price" className="text-sm font-medium">
                Price ($)
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="itemType" className="text-sm font-medium">
                Item Type
              </label>
              <select
                id="itemType"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="appetizer">Appetizer</option>
                <option value="main">Main Course</option>
                <option value="dessert">Dessert</option>
                <option value="drink">Drink</option>
                <option value="side">Side</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Item"}
            </Button>
          </div>
        </form>
      </AddItemDialog>
    );
  };

  const RenderDeleteMenuItem = ({ item }: { item: MenuItem }) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://api.alexanderthenotsobad.us/menu/${item.item_id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete menu item');
        }

        handleMenuItemDelete(item.item_id);
        setIsDeleteDialogOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    return (
      <AddItemDialog
        trigger={
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        }
        title="Delete Menu Item"
        description={`Are you sure you want to delete "${item.item_name}"? This action cannot be undone.`}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <div className="py-4">
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Item"}
            </Button>
          </div>
        </div>
      </AddItemDialog>
    );
  };

  const handleImageUploadSuccess = (imageId: number) => {
    if (!selectedItem) return;

    // Update the menu item in the state with the new image ID
    const updatedItems = menuItems.map(item =>
      item.item_id === selectedItem.item_id
        ? { ...item, image_id: imageId }
        : item
    );

    setMenuItems(updatedItems);
  };

  const handleMenuItemUpdate = (updatedItem: MenuItem) => {
    // Update the menu item in the state with all the updated fields
    const updatedItems = menuItems.map(item =>
      item.item_id === updatedItem.item_id
        ? updatedItem
        : item
    );

    setMenuItems(updatedItems);
  };
  const handleMenuItemDelete = (deletedItemId: number) => {
    // Remove the deleted item from the state
    const updatedItems = menuItems.filter(item => item.item_id !== deletedItemId);
    setMenuItems(updatedItems);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="w-full h-48 animate-pulse bg-slate-100" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Menu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item: MenuItem) => (
          <Card key={item.item_id} className="w-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{item.item_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 h-32 relative overflow-hidden rounded-md">
                {item.image_id ? (
                  <Image
                    src={`https://api.alexanderthenotsobad.us/api/images/${item.image_id}`}
                    alt={item.item_name}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                    unoptimized={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                    No image available
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">{item.item_desc}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">${formatPrice(item.price)}</span>
                <div className="flex space-x-2">
                  <RenderUpdateMenuItem item={item} />
                  <RenderDeleteMenuItem item={item} />
                  <AddItemDialog
                    trigger={
                      <Button variant="outline" size="sm">
                        {item.image_id ? 'Change Image' : 'Add Image'}
                      </Button>
                    }
                    title={`${item.image_id ? 'Update Image' : 'Add Image'} for ${item.item_name}`}
                    description="Upload a new image for this menu item. Supported formats: JPG, PNG."
                    isOpen={isDialogOpen && selectedItem?.item_id === item.item_id}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (open) {
                        setSelectedItem(item);
                      }
                    }}
                  >
                    {selectedItem && (
                      <ImageUpload
                        menuItemId={item.item_id}
                        onUploadSuccess={handleImageUploadSuccess}
                      />
                    )}
                  </AddItemDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default MenuList