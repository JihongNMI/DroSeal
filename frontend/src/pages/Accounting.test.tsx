import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import Accounting from './Accounting'
import * as useTransactionsModule from '../hooks/useTransactions'
import type { Transaction } from '../types'

// Mock the useTransactions hook
vi.mock('../hooks/useTransactions')

describe('Accounting Page - useTransactions Integration', () => {
  const mockSetData = vi.fn()
  
  const mockTransactions: Transaction[] = [
    {
      id: 'trans-1',
      type: 'expense',
      amount: 1000,
      description: 'Office supplies',
      category: 'Supplies',
      date: new Date('2024-01-15'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: 'trans-2',
      type: 'income',
      amount: 5000,
      description: 'Client payment',
      category: 'Sales',
      date: new Date('2024-01-20'),
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementation
    vi.mocked(useTransactionsModule.useTransactions).mockReturnValue({
      data: [],
      setData: mockSetData,
      loading: false,
      error: null,
    })
  })

  it('should use useTransactions hook instead of local state', () => {
    render(<Accounting />)
    
    // Verify the hook was called
    expect(useTransactionsModule.useTransactions).toHaveBeenCalled()
  })

  it('should display loading state when hook is loading', () => {
    vi.mocked(useTransactionsModule.useTransactions).mockReturnValue({
      data: [],
      setData: mockSetData,
      loading: true,
      error: null,
    })

    render(<Accounting />)
    
    expect(screen.getByText(/Loading transactions/i)).toBeInTheDocument()
  })

  it('should display error message when hook has error', () => {
    const errorMessage = 'Failed to load transactions'
    vi.mocked(useTransactionsModule.useTransactions).mockReturnValue({
      data: [],
      setData: mockSetData,
      loading: false,
      error: errorMessage,
    })

    render(<Accounting />)
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('should display transactions from hook data', () => {
    vi.mocked(useTransactionsModule.useTransactions).mockReturnValue({
      data: mockTransactions,
      setData: mockSetData,
      loading: false,
      error: null,
    })

    render(<Accounting />)
    
    // Verify transactions are displayed
    expect(screen.getByText('Office supplies')).toBeInTheDocument()
    expect(screen.getByText('Client payment')).toBeInTheDocument()
    expect(screen.getAllByText('¥1,000').length).toBeGreaterThan(0)
    expect(screen.getAllByText('¥5,000').length).toBeGreaterThan(0)
  })

  it('should call setData when adding a new transaction', async () => {
    const user = userEvent.setup()
    
    vi.mocked(useTransactionsModule.useTransactions).mockReturnValue({
      data: [],
      setData: mockSetData,
      loading: false,
      error: null,
    })

    render(<Accounting />)
    
    // Open add transaction modal
    const addButton = screen.getByRole('button', { name: /Add Transaction/i })
    await user.click(addButton)
    
    // Fill in the form
    const amountInput = screen.getByPlaceholderText(/Enter amount/i)
    const descriptionInput = screen.getByPlaceholderText(/Office supplies, Client payment/i)
    const categoryInput = screen.getByPlaceholderText(/Supplies, Sales, Services/i)
    
    await user.type(amountInput, '2000')
    await user.type(descriptionInput, 'Test transaction')
    await user.type(categoryInput, 'Test category')
    
    // Submit the form - get all buttons and click the last one (submit button in modal)
    const submitButtons = screen.getAllByRole('button', { name: /Add Transaction/i })
    await user.click(submitButtons[submitButtons.length - 1])
    
    // Verify setData was called with new transaction
    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'expense',
            amount: 2000,
            description: 'Test transaction',
            category: 'Test category',
          })
        ])
      )
    })
  })

  it('should calculate financial summaries correctly from hook data', () => {
    vi.mocked(useTransactionsModule.useTransactions).mockReturnValue({
      data: mockTransactions,
      setData: mockSetData,
      loading: false,
      error: null,
    })

    render(<Accounting />)
    
    // Verify summaries are calculated correctly
    // Total Expenses: 1000 (appears in summary card and table)
    expect(screen.getAllByText('¥1,000').length).toBeGreaterThan(0)
    
    // Total Revenue: 5000 (appears in summary card and table)
    expect(screen.getAllByText('¥5,000').length).toBeGreaterThan(0)
    
    // Verify the summary cards exist
    expect(screen.getByText('Total Expenses')).toBeInTheDocument()
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Current Asset Value')).toBeInTheDocument()
  })

  it('should not have any manual localStorage calls', () => {
    // This test verifies that the component doesn't directly use localStorage
    // by checking that the component renders without errors when localStorage is mocked
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem')
    const localStorageGetSpy = vi.spyOn(Storage.prototype, 'getItem')
    
    vi.mocked(useTransactionsModule.useTransactions).mockReturnValue({
      data: mockTransactions,
      setData: mockSetData,
      loading: false,
      error: null,
    })

    render(<Accounting />)
    
    // The component itself should not call localStorage directly
    // (the hook handles all localStorage operations)
    expect(localStorageSpy).not.toHaveBeenCalled()
    expect(localStorageGetSpy).not.toHaveBeenCalled()
    
    localStorageSpy.mockRestore()
    localStorageGetSpy.mockRestore()
  })
})
