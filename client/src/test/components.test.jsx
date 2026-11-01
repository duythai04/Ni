import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Frontend Layout & Components Unit Tests', () => {
  it('Header renders branding and Japanese N5 navigation pills', () => {
    render(<Header />, { wrapper: createWrapper() });

    expect(screen.getByText(/Nihongo/i)).toBeInTheDocument();
    expect(screen.getByText(/Trang chủ/i)).toBeInTheDocument();
    expect(screen.getByText(/Lộ trình/i)).toBeInTheDocument();
    expect(screen.getByText(/Bài học/i)).toBeInTheDocument();
    expect(screen.getByText(/Ôn tập/i)).toBeInTheDocument();
    expect(screen.getByText(/ngày/i)).toBeInTheDocument(); // streak badge
  });

  it('Sidebar renders all 7 navigation items matching screenshot', () => {
    render(<Sidebar />, { wrapper: createWrapper() });

    expect(screen.getByText(/Trang chủ/i)).toBeInTheDocument();
    expect(screen.getByText(/Bài học/i)).toBeInTheDocument();
    expect(screen.getByText(/Lộ trình/i)).toBeInTheDocument();
    expect(screen.getByText(/Ôn tập/i)).toBeInTheDocument();
    expect(screen.getByText(/Từ vựng/i)).toBeInTheDocument();
    expect(screen.getByText(/Kiểm tra/i)).toBeInTheDocument();
    expect(screen.getByText(/Tiến độ/i)).toBeInTheDocument();
    expect(screen.getByText(/Cài đặt/i)).toBeInTheDocument();
  });
});
