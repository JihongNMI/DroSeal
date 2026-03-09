import { describe, it, expect } from 'vitest'
import {
  getCategoryPath,
  getAncestors,
  getDescendants,
  getChildren,
  formatCategoryPath,
  validateCategoryName,
  isDescendant,
  searchCategories
} from './categoryService'
import { InventoryCategory } from '../types'

describe('categoryService', () => {
  // Test data: hierarchical category structure
  // Root
  //   ├── Electronics
  //   │   ├── Phones
  //   │   └── Laptops
  //   └── Books
  //       └── Fiction
  const mockCategories: InventoryCategory[] = [
    {
      id: 'root',
      name: 'Root',
      parentId: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'electronics',
      name: 'Electronics',
      parentId: 'root',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'books',
      name: 'Books',
      parentId: 'root',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'phones',
      name: 'Phones',
      parentId: 'electronics',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'laptops',
      name: 'Laptops',
      parentId: 'electronics',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'fiction',
      name: 'Fiction',
      parentId: 'books',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  describe('getCategoryPath', () => {
    it('should return path from root to target category', () => {
      const path = getCategoryPath('phones', mockCategories)
      expect(path).toHaveLength(3)
      expect(path[0].id).toBe('root')
      expect(path[1].id).toBe('electronics')
      expect(path[2].id).toBe('phones')
    })

    it('should return single element for root category', () => {
      const path = getCategoryPath('root', mockCategories)
      expect(path).toHaveLength(1)
      expect(path[0].id).toBe('root')
    })

    it('should return empty array for non-existent category', () => {
      const path = getCategoryPath('nonexistent', mockCategories)
      expect(path).toHaveLength(0)
    })

    it('should handle deeply nested categories', () => {
      const path = getCategoryPath('fiction', mockCategories)
      expect(path).toHaveLength(3)
      expect(path[0].id).toBe('root')
      expect(path[1].id).toBe('books')
      expect(path[2].id).toBe('fiction')
    })
  })

  describe('getAncestors', () => {
    it('should return all ancestors excluding the target category', () => {
      const ancestors = getAncestors('phones', mockCategories)
      expect(ancestors).toHaveLength(2)
      expect(ancestors[0].id).toBe('root')
      expect(ancestors[1].id).toBe('electronics')
    })

    it('should return empty array for root category', () => {
      const ancestors = getAncestors('root', mockCategories)
      expect(ancestors).toHaveLength(0)
    })

    it('should return single ancestor for direct child of root', () => {
      const ancestors = getAncestors('electronics', mockCategories)
      expect(ancestors).toHaveLength(1)
      expect(ancestors[0].id).toBe('root')
    })

    it('should return empty array for non-existent category', () => {
      const ancestors = getAncestors('nonexistent', mockCategories)
      expect(ancestors).toHaveLength(0)
    })
  })

  describe('getDescendants', () => {
    it('should return all descendants recursively', () => {
      const descendants = getDescendants('electronics', mockCategories)
      expect(descendants).toHaveLength(2)
      expect(descendants.map(d => d.id)).toContain('phones')
      expect(descendants.map(d => d.id)).toContain('laptops')
    })

    it('should return all descendants from root', () => {
      const descendants = getDescendants('root', mockCategories)
      expect(descendants).toHaveLength(5)
      expect(descendants.map(d => d.id)).toContain('electronics')
      expect(descendants.map(d => d.id)).toContain('books')
      expect(descendants.map(d => d.id)).toContain('phones')
      expect(descendants.map(d => d.id)).toContain('laptops')
      expect(descendants.map(d => d.id)).toContain('fiction')
    })

    it('should return empty array for leaf category', () => {
      const descendants = getDescendants('phones', mockCategories)
      expect(descendants).toHaveLength(0)
    })

    it('should return empty array for non-existent category', () => {
      const descendants = getDescendants('nonexistent', mockCategories)
      expect(descendants).toHaveLength(0)
    })
  })

  describe('getChildren', () => {
    it('should return direct children only', () => {
      const children = getChildren('electronics', mockCategories)
      expect(children).toHaveLength(2)
      expect(children.map(c => c.id)).toContain('phones')
      expect(children.map(c => c.id)).toContain('laptops')
    })

    it('should return top-level categories when parentId is undefined', () => {
      const children = getChildren(undefined, mockCategories)
      expect(children).toHaveLength(1)
      expect(children[0].id).toBe('root')
    })

    it('should return empty array for leaf category', () => {
      const children = getChildren('phones', mockCategories)
      expect(children).toHaveLength(0)
    })

    it('should not include grandchildren', () => {
      const children = getChildren('root', mockCategories)
      expect(children).toHaveLength(2)
      expect(children.map(c => c.id)).toContain('electronics')
      expect(children.map(c => c.id)).toContain('books')
      expect(children.map(c => c.id)).not.toContain('phones')
      expect(children.map(c => c.id)).not.toContain('laptops')
      expect(children.map(c => c.id)).not.toContain('fiction')
    })
  })

  describe('formatCategoryPath', () => {
    it('should format path with > separator', () => {
      const formatted = formatCategoryPath('phones', mockCategories)
      expect(formatted).toBe('Root > Electronics > Phones')
    })

    it('should return single name for root category', () => {
      const formatted = formatCategoryPath('root', mockCategories)
      expect(formatted).toBe('Root')
    })

    it('should return empty string for non-existent category', () => {
      const formatted = formatCategoryPath('nonexistent', mockCategories)
      expect(formatted).toBe('')
    })

    it('should handle deeply nested paths', () => {
      const formatted = formatCategoryPath('fiction', mockCategories)
      expect(formatted).toBe('Root > Books > Fiction')
    })
  })

  describe('edge cases', () => {
    it('should handle empty categories array', () => {
      expect(getCategoryPath('any', [])).toHaveLength(0)
      expect(getAncestors('any', [])).toHaveLength(0)
      expect(getDescendants('any', [])).toHaveLength(0)
      expect(getChildren('any', [])).toHaveLength(0)
      expect(formatCategoryPath('any', [])).toBe('')
    })

    it('should handle orphaned categories (parent not found)', () => {
      const orphanedCategories: InventoryCategory[] = [
        {
          id: 'orphan',
          name: 'Orphan',
          parentId: 'nonexistent-parent',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const path = getCategoryPath('orphan', orphanedCategories)
      expect(path).toHaveLength(1)
      expect(path[0].id).toBe('orphan')
    })
  })

  describe('validateCategoryName', () => {
    it('should return true for unique name under same parent', () => {
      const isValid = validateCategoryName('Tablets', 'electronics', mockCategories)
      expect(isValid).toBe(true)
    })

    it('should return false for duplicate name under same parent', () => {
      const isValid = validateCategoryName('Phones', 'electronics', mockCategories)
      expect(isValid).toBe(false)
    })

    it('should return true for same name under different parent', () => {
      const isValid = validateCategoryName('Phones', 'books', mockCategories)
      expect(isValid).toBe(true)
    })

    it('should return true for same name at different level (top-level vs nested)', () => {
      // 'Electronics' exists under 'root', so checking at top level (undefined) should be valid
      const isValid = validateCategoryName('Electronics', undefined, mockCategories)
      expect(isValid).toBe(true) // Different parent (undefined vs 'root'), so allowed
      
      const isValidDifferentParent = validateCategoryName('Electronics', 'books', mockCategories)
      expect(isValidDifferentParent).toBe(true) // Different parent, so allowed
    })

    it('should exclude specified category ID when validating (for updates)', () => {
      // When updating 'phones' category, it should not conflict with itself
      const isValid = validateCategoryName('Phones', 'electronics', mockCategories, 'phones')
      expect(isValid).toBe(true)
    })

    it('should return true for unique name at top level', () => {
      const isValid = validateCategoryName('NewTopLevel', undefined, mockCategories)
      expect(isValid).toBe(true)
    })

    it('should return false for duplicate name at top level', () => {
      const isValid = validateCategoryName('Root', undefined, mockCategories)
      expect(isValid).toBe(false)
    })

    it('should handle empty categories array', () => {
      const isValid = validateCategoryName('AnyName', undefined, [])
      expect(isValid).toBe(true)
    })
  })

  describe('isDescendant', () => {
    it('should return true for direct child', () => {
      const result = isDescendant('electronics', 'phones', mockCategories)
      expect(result).toBe(true)
    })

    it('should return true for grandchild', () => {
      const result = isDescendant('root', 'phones', mockCategories)
      expect(result).toBe(true)
    })

    it('should return false for parent', () => {
      const result = isDescendant('phones', 'electronics', mockCategories)
      expect(result).toBe(false)
    })

    it('should return false for sibling', () => {
      const result = isDescendant('phones', 'laptops', mockCategories)
      expect(result).toBe(false)
    })

    it('should return false for same category', () => {
      const result = isDescendant('phones', 'phones', mockCategories)
      expect(result).toBe(false)
    })

    it('should return false for unrelated categories', () => {
      const result = isDescendant('electronics', 'fiction', mockCategories)
      expect(result).toBe(false)
    })

    it('should return true for deeply nested descendant', () => {
      const result = isDescendant('root', 'fiction', mockCategories)
      expect(result).toBe(true)
    })

    it('should return false for non-existent category', () => {
      const result = isDescendant('nonexistent', 'phones', mockCategories)
      expect(result).toBe(false)
    })

    it('should return false when checking against non-existent descendant', () => {
      const result = isDescendant('electronics', 'nonexistent', mockCategories)
      expect(result).toBe(false)
    })

    it('should handle empty categories array', () => {
      const result = isDescendant('any', 'any', [])
      expect(result).toBe(false)
    })
  })

  describe('searchCategories', () => {
    it('should return empty sets for empty query', () => {
      const result = searchCategories('', mockCategories)
      expect(result.matchedCategories.size).toBe(0)
      expect(result.visibleCategories.size).toBe(0)
    })

    it('should return empty sets for whitespace-only query', () => {
      const result = searchCategories('   ', mockCategories)
      expect(result.matchedCategories.size).toBe(0)
      expect(result.visibleCategories.size).toBe(0)
    })

    it('should match category by exact name', () => {
      const result = searchCategories('Phones', mockCategories)
      expect(result.matchedCategories.has('phones')).toBe(true)
      expect(result.matchedCategories.size).toBe(1)
    })

    it('should match category case-insensitively', () => {
      const result = searchCategories('phones', mockCategories)
      expect(result.matchedCategories.has('phones')).toBe(true)
      expect(result.matchedCategories.size).toBe(1)
    })

    it('should match category by partial name', () => {
      const result = searchCategories('Phon', mockCategories)
      expect(result.matchedCategories.has('phones')).toBe(true)
      expect(result.matchedCategories.size).toBe(1)
    })

    it('should include matched category in visible categories', () => {
      const result = searchCategories('Phones', mockCategories)
      expect(result.visibleCategories.has('phones')).toBe(true)
    })

    it('should include all ancestors of matched category in visible categories', () => {
      const result = searchCategories('Phones', mockCategories)
      expect(result.visibleCategories.has('phones')).toBe(true)
      expect(result.visibleCategories.has('electronics')).toBe(true)
      expect(result.visibleCategories.has('root')).toBe(true)
      expect(result.visibleCategories.size).toBe(3)
    })

    it('should include all descendants of matched category in visible categories', () => {
      const result = searchCategories('Electronics', mockCategories)
      expect(result.visibleCategories.has('electronics')).toBe(true)
      expect(result.visibleCategories.has('phones')).toBe(true)
      expect(result.visibleCategories.has('laptops')).toBe(true)
      expect(result.visibleCategories.has('root')).toBe(true) // ancestor
      expect(result.visibleCategories.size).toBe(4)
    })

    it('should match multiple categories', () => {
      const result = searchCategories('o', mockCategories) // matches 'Root', 'Electronics', 'Books', 'Phones', 'Laptops', 'Fiction'
      expect(result.matchedCategories.has('root')).toBe(true)
      expect(result.matchedCategories.has('electronics')).toBe(true)
      expect(result.matchedCategories.has('books')).toBe(true)
      expect(result.matchedCategories.has('phones')).toBe(true)
      expect(result.matchedCategories.has('laptops')).toBe(true)
      expect(result.matchedCategories.has('fiction')).toBe(true)
      expect(result.matchedCategories.size).toBe(6)
    })

    it('should include ancestors and descendants for all matched categories', () => {
      const result = searchCategories('Books', mockCategories)
      expect(result.matchedCategories.has('books')).toBe(true)
      expect(result.visibleCategories.has('books')).toBe(true)
      expect(result.visibleCategories.has('root')).toBe(true) // ancestor
      expect(result.visibleCategories.has('fiction')).toBe(true) // descendant
      expect(result.visibleCategories.size).toBe(3)
    })

    it('should not include unrelated categories in visible set', () => {
      const result = searchCategories('Phones', mockCategories)
      expect(result.visibleCategories.has('books')).toBe(false)
      expect(result.visibleCategories.has('fiction')).toBe(false)
      expect(result.visibleCategories.has('laptops')).toBe(false)
    })

    it('should handle no matches', () => {
      const result = searchCategories('NonExistent', mockCategories)
      expect(result.matchedCategories.size).toBe(0)
      expect(result.visibleCategories.size).toBe(0)
    })

    it('should handle empty categories array', () => {
      const result = searchCategories('anything', [])
      expect(result.matchedCategories.size).toBe(0)
      expect(result.visibleCategories.size).toBe(0)
    })

    it('should handle leaf category match (no descendants)', () => {
      const result = searchCategories('Fiction', mockCategories)
      expect(result.matchedCategories.has('fiction')).toBe(true)
      expect(result.visibleCategories.has('fiction')).toBe(true)
      expect(result.visibleCategories.has('books')).toBe(true) // ancestor
      expect(result.visibleCategories.has('root')).toBe(true) // ancestor
      expect(result.visibleCategories.size).toBe(3)
    })

    it('should handle root category match (no ancestors)', () => {
      const result = searchCategories('Root', mockCategories)
      expect(result.matchedCategories.has('root')).toBe(true)
      expect(result.visibleCategories.has('root')).toBe(true)
      // Should include all descendants
      expect(result.visibleCategories.has('electronics')).toBe(true)
      expect(result.visibleCategories.has('books')).toBe(true)
      expect(result.visibleCategories.has('phones')).toBe(true)
      expect(result.visibleCategories.has('laptops')).toBe(true)
      expect(result.visibleCategories.has('fiction')).toBe(true)
      expect(result.visibleCategories.size).toBe(6)
    })
  })
})
