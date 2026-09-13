export type CreatePhoneWallet = {
  phone: string;
};

export type UpdatePhoneWallet = {
  walletId: string;
  phone: string;
};

export type CreateBankWallet = {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  bankBranch: string;
  branchCode: string;
  country: string;
  swiftCode: string;
  address: string;
};

export type UpdateBankWallet = {
  walletId: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  bankBranch: string;
  branchCode: string;
  country: string;
  swiftCode: string;
  address: string;
};

export type Wallet = {
  id: string;
  user: string;
  walletType: 'phone' | 'bank';
  phone?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  bankBranch?: string;
  branchCode?: string;
  country: string;
  swiftCode?: string;
  address?: string;
  isActive: boolean;
  dateCreated: string;
};
