export type Box = { id: string; name: string; size: number; discount: number; note?: string }

export type KitSpec = { name: string; box: string; slugs: string[]; message?: string }

export type AdminBox = Box & { active: boolean; sort_order: number }
