"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { MenuItem } from "@/types/menu";

export interface OrderTrayItem {
  item_id: number;
  item_name: string;
  item_desc?: string;
  image?: string;
  price: number;
  quantity: number;
  special_instructions?: string;
}

type OrderTrayContextType = {
  orderItems: OrderTrayItem[];
  isOrderTrayOpen: boolean;
  addToOrder: (
    menuItem: MenuItem & { image?: string },
    quantity: number,
    specialInstructions?: string,
  ) => void;
  removeFromOrder: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  updateSpecialInstructions: (itemId: number, instructions: string) => void;
  clearOrder: () => void;
  getItemQuantity: (itemId: number) => number;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  toggleOrderTray: () => void;
  closeOrderTray: () => void;
};

const OrderTrayContext = createContext<OrderTrayContextType>({
  orderItems: [],
  isOrderTrayOpen: false,
  addToOrder: () => {},
  removeFromOrder: () => {},
  updateQuantity: () => {},
  updateSpecialInstructions: () => {},
  clearOrder: () => {},
  getItemQuantity: () => 0,
  getTotalItems: () => 0,
  getTotalPrice: () => 0,
  toggleOrderTray: () => {},
  closeOrderTray: () => {},
});

export const OrderTrayProvider = ({ children }: { children: ReactNode }) => {
  const [orderItems, setOrderItems] = useState<OrderTrayItem[]>([]);
  const [isOrderTrayOpen, setIsOrderTrayOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Read the saved tray after mount so server and client render the same
  // initial markup. The tray is still instant for the guest after hydration.
  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem("orderItems");
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder) as unknown;
        if (Array.isArray(parsed)) setOrderItems(parsed as OrderTrayItem[]);
      }
    } catch {
      // Corrupt or unavailable storage: start empty.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("orderItems", JSON.stringify(orderItems));
    } catch {
      // Storage is best-effort; the in-memory tray still works.
    }
  }, [orderItems, hydrated]);

  const toggleOrderTray = useCallback(
    () => setIsOrderTrayOpen((previous) => !previous),
    [],
  );

  const closeOrderTray = useCallback(() => setIsOrderTrayOpen(false), []);

  const addToOrder = useCallback(
    (
      menuItem: MenuItem & { image?: string },
      quantity: number,
      specialInstructions?: string,
    ) => {
      setOrderItems((previousItems) => {
        const existingItemIndex = previousItems.findIndex(
          (item) => item.item_id === menuItem.item_id,
        );

        if (existingItemIndex !== -1) {
          const updatedItems = [...previousItems];
          const existing = updatedItems[existingItemIndex];
          updatedItems[existingItemIndex] = {
            ...existing,
            quantity: existing.quantity + quantity,
            special_instructions:
              specialInstructions || existing.special_instructions,
          };
          return updatedItems;
        }

        return [
          ...previousItems,
          {
            item_id: menuItem.item_id,
            item_name: menuItem.item_name,
            item_desc: menuItem.item_desc,
            image: menuItem.image,
            price: menuItem.price,
            quantity,
            special_instructions: specialInstructions || "",
          },
        ];
      });
    },
    [],
  );

  const removeFromOrder = useCallback((itemId: number) => {
    setOrderItems((previousItems) =>
      previousItems.filter((item) => item.item_id !== itemId),
    );
  }, []);

  const updateQuantity = useCallback(
    (itemId: number, quantity: number) => {
      if (quantity <= 0) {
        removeFromOrder(itemId);
        return;
      }
      setOrderItems((previousItems) =>
        previousItems.map((item) =>
          item.item_id === itemId ? { ...item, quantity } : item,
        ),
      );
    },
    [removeFromOrder],
  );

  const updateSpecialInstructions = useCallback(
    (itemId: number, instructions: string) => {
      setOrderItems((previousItems) =>
        previousItems.map((item) =>
          item.item_id === itemId
            ? { ...item, special_instructions: instructions }
            : item,
        ),
      );
    },
    [],
  );

  const clearOrder = useCallback(() => setOrderItems([]), []);

  const getItemQuantity = useCallback(
    (itemId: number) =>
      orderItems.find((item) => item.item_id === itemId)?.quantity ?? 0,
    [orderItems],
  );

  const getTotalItems = useCallback(
    () => orderItems.reduce((total, item) => total + item.quantity, 0),
    [orderItems],
  );

  const getTotalPrice = useCallback(
    () =>
      orderItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    [orderItems],
  );

  const value = useMemo(
    () => ({
      orderItems,
      addToOrder,
      removeFromOrder,
      updateQuantity,
      updateSpecialInstructions,
      clearOrder,
      getItemQuantity,
      getTotalItems,
      getTotalPrice,
      isOrderTrayOpen,
      toggleOrderTray,
      closeOrderTray,
    }),
    [
      orderItems,
      addToOrder,
      removeFromOrder,
      updateQuantity,
      updateSpecialInstructions,
      clearOrder,
      getItemQuantity,
      getTotalItems,
      getTotalPrice,
      isOrderTrayOpen,
      toggleOrderTray,
      closeOrderTray,
    ],
  );

  return (
    <OrderTrayContext.Provider value={value}>{children}</OrderTrayContext.Provider>
  );
};

export const useOrderTray = () => useContext(OrderTrayContext);
