import { useState } from 'react';
import withAuth from '../../utils/withAuth';
import { removeToken } from '../../utils/auth-utils';
import { useRouter } from 'next/router';
import api from '../../utils/api';
import { toast } from 'react-toastify';

function CustomerDashboard() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/vouchers/best-vouchers', { amount: parseFloat(amount) });
      setVouchers(response.data);
    } catch (error) {
      toast.error('Failed to fetch vouchers');
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoucherSelect = async (voucher) => {
    try {
      await api.post('/redeem-voucher', { code: voucher.code });
      toast.success('Voucher redeemed successfully!');
      setVouchers(vouchers.filter(v => v.code !== voucher.code));
    } catch (error) {
      toast.error('Failed to redeem voucher');
      console.error('Error redeeming voucher:', error);
    }
  };

  const formatVoucherValue = (voucher) => {
    if (voucher.type === 'PERCENTAGE') {
      return `${voucher.value}% off`;
    }
    return `$${voucher.value} off`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Find Best Vouchers</h1>
        <button
          onClick={() => {
            removeToken();
            router.push('/auth/login');
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleSearch} className="max-w-sm mx-auto mb-8">
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
            min="0"
            step="0.01"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Find Vouchers
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center">Loading vouchers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.map((voucher) => (
            <div key={voucher.code} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{formatVoucherValue(voucher)}</h3>
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                  {voucher.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Code: {voucher.code}</p>
              {voucher.maxDiscount && (
                <p className="text-sm text-gray-500 mb-2">Max discount: ${voucher.maxDiscount}</p>
              )}
              <p className="text-sm text-gray-500 mb-4">
                Uses left: {voucher.totalUsages - voucher.currentUsage}
              </p>
              <button
                onClick={() => handleVoucherSelect(voucher)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Select Voucher
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && vouchers.length === 0 && (
        <div className="text-center text-gray-500">
          No vouchers found. Try searching with a different amount.
        </div>
      )}
    </div>
  );
}

export default withAuth(CustomerDashboard, ['CUSTOMER']);