type MockQueryBuilder = {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
};

function createMockQueryBuilder(): MockQueryBuilder {
  const builder: Partial<MockQueryBuilder> = {};
  builder.select = jest.fn().mockReturnValue(builder);
  builder.insert = jest.fn().mockReturnValue(builder);
  builder.update = jest.fn().mockReturnValue(builder);
  builder.delete = jest.fn().mockReturnValue(builder);
  builder.eq = jest.fn().mockReturnValue(builder);
  builder.single = jest.fn().mockResolvedValue({ data: null, error: null });
  return builder as MockQueryBuilder;
}

export function createSupabaseMock() {
  const from = jest.fn().mockImplementation(() => createMockQueryBuilder());

  return {
    from,
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: null
        },
        error: null
      })
    }
  };
}
