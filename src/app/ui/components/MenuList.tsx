// /var/www/html/nvrs-ts-v1/src/app/ui/components/MenuList.tsx
"use client"

import { useState, useEffect } from 'react'
import type { MenuItem } from '@/types/menu'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import ImageUpload from './ImageUpload'
import AddItemDialog from './AddItemDialog'
import UpdateMenuItem from './UpdateMenuItem'
import DeleteMenuItem from './DeleteMenuItem'
import AddToOrderButton from './AddToOrderButton'
import { useUserRole } from '@/context/UserContext'

// Simple menu item display component without order functionality
const MenuItemDisplay = ({ item }: { item: MenuItem }) => {
  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
  }

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
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
        </div>
      </CardContent>
    </Card>
  )
}

const MenuList = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { userRole } = useUserRole()
  const isAdmin = userRole === 'admin'
  const isPatron = userRole === 'patron'

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('https://api.alexanderthenotsobad.us/')
        if (!response.ok) {
          throw new Error('Failed to fetch menu items')
        }
        const data = await response.json()
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



  const handleImageUploadSuccess = (imageId: number) => {
    if (!selectedItem) return;
    const updatedItems = menuItems.map(item =>
      item.item_id === selectedItem.item_id
        ? { ...item, image_id: imageId }
        : item
    );
    setMenuItems(updatedItems);
  };

  const handleMenuItemUpdate = (updatedItem: MenuItem) => {
    const updatedItems = menuItems.map(item =>
      item.item_id === updatedItem.item_id
        ? updatedItem
        : item
    );
    setMenuItems(updatedItems);
  };

  const handleMenuItemDelete = (deletedItemId: number) => {
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
          <div key={item.item_id} className="relative">
            <MenuItemDisplay item={item} />

            {/* Position Add to Order button at the bottom of the card */}
            {isPatron && (
              <div className="absolute bottom-4 right-4 z-10">
                <AddToOrderButton menuItem={item} />
              </div>
            )}

            {/* Admin controls */}
            {isAdmin && (
              <div className="absolute bottom-4 right-4 z-10 flex space-x-2">
                <UpdateMenuItem
                  menuItem={item}
                  onUpdateSuccess={handleMenuItemUpdate}
                />
                <DeleteMenuItem
                  menuItem={item}
                  onDeleteSuccess={handleMenuItemDelete}
                />

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
                      currentImageId={item.image_id} // Add this prop to pass the current image ID
                    />
                  )}
                </AddItemDialog>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MenuList