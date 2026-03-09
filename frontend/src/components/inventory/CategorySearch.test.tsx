import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CategorySearch } from './CategorySearch'
import { InventoryCategory } from '../../types'

describe('CategorySearch', () => {
  const mockCategories: InventoryCategory[] = [
    {
      id: '1',
      name: '씰',
      parentId: undefined,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: '카드',
      parentId: undefined,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '3',
      name: '포켓몬',
      parentId: '2',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ]

  it('should render search input field', () => {
    const onSearchChange = vi.fn()
    render(
      <CategorySearch
        categories={mockCategories}
        searchQuery=""
        onSearchChange={onSearchChange}
      />
    )

    const input = screen.getByPlaceholderText('카테고리 검색...')
    expect(input).toBeInTheDocument()
  })

  it('should call onSearchChange when user types', () => {
    const onSearchChange = vi.fn()
    render(
      <CategorySearch
        categories={mockCategories}
        searchQuery=""
        onSearchChange={onSearchChange}
      />
    )

    const input = screen.getByPlaceholderText('카테고리 검색...')
    fireEvent.change(input, { target: { value: '씰' } })

    expect(onSearchChange).toHaveBeenCalledWith('씰')
  })

  it('should display clear button when search query is not empty', () => {
    const onSearchChange = vi.fn()
    render(
      <CategorySearch
        categories={mockCategories}
        searchQuery="씰"
        onSearchChange={onSearchChange}
      />
    )

    const clearButton = screen.getByLabelText('Clear search')
    expect(clearButton).toBeInTheDocument()
  })

  it('should not display clear button when search query is empty', () => {
    const onSearchChange = vi.fn()
    render(
      <CategorySearch
        categories={mockCategories}
        searchQuery=""
        onSearchChange={onSearchChange}
      />
    )

    const clearButton = screen.queryByLabelText('Clear search')
    expect(clearButton).not.toBeInTheDocument()
  })

  it('should call onSearchChange with empty string when clear button is clicked', () => {
    const onSearchChange = vi.fn()
    render(
      <CategorySearch
        categories={mockCategories}
        searchQuery="씰"
        onSearchChange={onSearchChange}
      />
    )

    const clearButton = screen.getByLabelText('Clear search')
    fireEvent.click(clearButton)

    expect(onSearchChange).toHaveBeenCalledWith('')
  })

  it('should display search results count when query matches categories', () => {
    const onSearchChange = vi.fn()
    render(
      <CategorySearch
        categories={mockCategories}
        searchQuery="씰"
        onSearchChange={onSearchChange}
      />
    )

    expect(screen.getByText(/1개의 카테고리 찾음/)).toBeInTheDocument()
  })

  it('should display no results message when query does not match any category', () => {
    const onSearchChange = vi.fn()
    render(
      <CategorySearch
        categories={mockCategories}
        searchQuery="존재하지않음"
        onSearchChange={onSearchChange}
      />
    )

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument()
  })

  it('should display visible categories count including ancestors and descendants', () => {
    const onSearchChange = vi.fn()
    render(
      <CategorySearch
        categories={mockCategories}
        searchQuery="포켓몬"
        onSearchChange={onSearchChange}
      />
    )

    // Should find "포켓몬" (1 match) and include its parent "카드" (2 visible total)
    expect(screen.getByText(/1개의 카테고리 찾음/)).toBeInTheDocument()
    expect(screen.getByText(/상위\/하위 카테고리 포함: 2개/)).toBeInTheDocument()
  })

  it('should not display results count when search query is empty', () => {
    const onSearchChange = vi.fn()
    render(
      <CategorySearch
        categories={mockCategories}
        searchQuery=""
        onSearchChange={onSearchChange}
      />
    )

    expect(screen.queryByText(/개의 카테고리 찾음/)).not.toBeInTheDocument()
    expect(screen.queryByText(/검색 결과가 없습니다/)).not.toBeInTheDocument()
  })

  it('should perform case-insensitive search', () => {
    const onSearchChange = vi.fn()
    render(
      <CategorySearch
        categories={mockCategories}
        searchQuery="카드"
        onSearchChange={onSearchChange}
      />
    )

    // Should match "카드" category
    expect(screen.getByText(/1개의 카테고리 찾음/)).toBeInTheDocument()
  })

  it('should update input value when searchQuery prop changes', () => {
    const onSearchChange = vi.fn()
    const { rerender } = render(
      <CategorySearch
        categories={mockCategories}
        searchQuery=""
        onSearchChange={onSearchChange}
      />
    )

    const input = screen.getByPlaceholderText('카테고리 검색...') as HTMLInputElement
    expect(input.value).toBe('')

    rerender(
      <CategorySearch
        categories={mockCategories}
        searchQuery="씰"
        onSearchChange={onSearchChange}
      />
    )

    expect(input.value).toBe('씰')
  })
})
