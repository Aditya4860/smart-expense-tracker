describe('Expense Module Tests', () => {
  beforeEach(() => {
    // Setup Mock JWT Auth token before tests
    cy.window().then((win) => {
      // Basic mock token matching the AuthContext expectation
      win.localStorage.setItem('set_auth_token', 'mock.jwt.token');
      win.localStorage.setItem('set_auth_user', JSON.stringify({
        id: 'user_123',
        email: 'test@example.com',
        name: 'test'
      }));
    });
    
    // Intercept backend API calls for Expenses
    cy.intercept('GET', '**/api/v1/expenses*', { fixture: 'expenses.json' }).as('getExpenses');
    cy.intercept('POST', '**/api/v1/expenses', { statusCode: 201, body: { id: 'new-id', title: 'New Expense', amount: 10, category: 'Food', transaction_date: '2024-01-01', type: 'expense' } }).as('addExpense');
    cy.intercept('PUT', '**/api/v1/expenses/*', { statusCode: 200, body: { id: 'new-id', title: 'Updated Expense', amount: 20, category: 'Food', transaction_date: '2024-01-01', type: 'expense' } }).as('editExpense');
    cy.intercept('DELETE', '**/api/v1/expenses/*', { statusCode: 204 }).as('deleteExpense');
    cy.intercept('GET', '**/api/v1/expenses/search*', { body: [] }).as('searchExpenses');
    
    // Visit expenses page
    cy.visit('/expenses');
  });

  it('Verifies JWT Authentication presence', () => {
    cy.wait('@getExpenses').its('request.headers').should('have.property', 'authorization', 'Bearer mock.jwt.token');
  });

  it('Adds a new expense', () => {
    // Note: Adjust selectors to match actual frontend UI components.
    cy.get('[data-testid="add-expense-button"]').should('exist').click();
    cy.get('[name="title"]').type('New Expense');
    cy.get('[name="amount"]').type('10');
    cy.get('[name="category"]').select('Food');
    cy.get('[name="date"]').type('2024-01-01');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@addExpense').its('request.body').should('deep.include', {
      title: 'New Expense',
      amount: 10
    });
  });

  it('Edits an existing expense', () => {
    // Assuming expense items have edit buttons
    cy.get('[data-testid="edit-expense-btn"]').first().click();
    cy.get('[name="title"]').clear().type('Updated Expense');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@editExpense');
  });

  it('Deletes an expense', () => {
    cy.get('[data-testid="delete-expense-btn"]').first().click();
    // confirm deletion if prompted
    cy.get('[data-testid="confirm-delete"]').click();
    
    cy.wait('@deleteExpense');
  });

  it('Searches for an expense', () => {
    cy.get('[data-testid="search-input"]').type('coffee');
    cy.wait('@searchExpenses').its('request.url').should('include', 'q=coffee');
  });

  it('Filters expenses by category', () => {
    cy.get('[data-testid="category-filter"]').select('Food');
    cy.wait('@getExpenses').its('request.url').should('include', 'category=Food');
  });

  it('Handles pagination correctly', () => {
    cy.get('[data-testid="next-page-btn"]').click();
    cy.wait('@getExpenses').its('request.url').should('include', 'skip=100'); // Assuming limit is 100
  });
});
