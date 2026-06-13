jest.mock('typeorm-transactional', () => {
  return {
    Transactional: () => (target: any, key: string, descriptor: any) => {
      return descriptor; 
    },
    initializeTransactionalContext: jest.fn(),
    addTransactionalDataSource: jest.fn(),
  };
});