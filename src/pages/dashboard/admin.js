import { useState, useEffect } from 'react';
import withAuth from '../../utils/withAuth';
import { getToken, removeToken } from '../../utils/auth-utils';
import { useRouter } from 'next/router';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

function AdminDashboard() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [expandedCampaign, setExpandedCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showVoucherForm, setShowVoucherForm] = useState(false);

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE'
  });

  // Voucher form state
  const [voucherForm, setVoucherForm] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    maxLimit: '',
    maxDiscount: '',
    maxUsagePerUser: 1,
    totalUsages: 10,
    expirationDate: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await api.get('/campaigns');
      setCampaigns(response.data);
    } catch (error) {
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && selectedCampaign) {
        await api.put(`/campaigns/${selectedCampaign._id}`, campaignForm);
        toast.success('Campaign updated successfully');
      } else {
        await api.post('/campaigns', campaignForm);
        toast.success('Campaign created successfully');
      }
      fetchCampaigns();
      resetCampaignForm();
    } catch (error) {
      toast.error(isEditing ? 'Failed to update campaign' : 'Failed to create campaign');
    }
  };

  const handleVoucherSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken(); // Use getToken helper instead of direct localStorage access
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }
  
      const voucherData = {
        ...voucherForm,
        campaignId: selectedCampaign._id
      };
  
      const response = await api.post('/vouchers', voucherData);
      
      if (response.data) {
        toast.success('Voucher created successfully');
        fetchCampaigns();
        resetVoucherForm();
      }
    } catch (error) {
      console.error('Voucher creation error:', error);
      
      // Check for specific error types
      if (error.response?.status === 401) {
        toast.error('Session expired. Please refresh the page');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create voucher');
      }
    }
  };
  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await api.delete(`/campaigns/${campaignId}`);
        toast.success('Campaign deleted successfully');
        fetchCampaigns();
      } catch (error) {
        toast.error('Failed to delete campaign');
      }
    }
  };

  const handleDeleteVoucher = async (voucherId) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      try {
        await api.delete(`/vouchers/${voucherId}`);
        toast.success('Voucher deleted successfully');
        fetchCampaigns();
      } catch (error) {
        toast.error('Failed to delete voucher');
      }
    }
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'ACTIVE'
    });
    setIsEditing(false);
    setSelectedCampaign(null);
  };

  const resetVoucherForm = () => {
    setVoucherForm({
      code: '',
      type: 'PERCENTAGE',
      value: '',
      maxLimit: '',
      maxDiscount: '',
      maxUsagePerUser: 1,
      totalUsages: 10,
      expirationDate: ''
    });
    setShowVoucherForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
          <button
            onClick={() => {
              removeToken();
              router.push('/auth/login');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Campaign Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Edit Campaign' : 'Create New Campaign'}
          </h2>
          <form onSubmit={handleCampaignSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Campaign Name"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                className="px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={campaignForm.description}
                onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                className="px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="datetime-local"
                value={campaignForm.startDate}
                onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                className="px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="datetime-local"
                value={campaignForm.endDate}
                onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                className="px-4 py-2 border rounded-lg"
                required
              />
              <select
                value={campaignForm.status}
                onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isEditing ? 'Update Campaign' : 'Create Campaign'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetCampaignForm}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading campaigns...</div>
          ) : (
            campaigns.map((campaign) => (
              <div key={campaign._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{campaign.name}</h3>
                    <p className="text-gray-600">{campaign.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Start: {new Date(campaign.startDate).toLocaleString()}</p>
                      <p>End: {new Date(campaign.endDate).toLocaleString()}</p>
                      <p>Status: {campaign.status}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setCampaignForm({
                          name: campaign.name,
                          description: campaign.description,
                          startDate: campaign.startDate?.slice(0, 16),
                          endDate: campaign.endDate?.slice(0, 16),
                          status: campaign.status
                        });
                        setIsEditing(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(campaign._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button
                      onClick={() => setExpandedCampaign(expandedCampaign === campaign._id ? null : campaign._id)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                    >
                      {expandedCampaign === campaign._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {expandedCampaign === campaign._id && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold">Vouchers</h4>
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowVoucherForm(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Plus size={20} />
                        Add Voucher
                      </button>
                    </div>

                    {/* Voucher Form */}
                    {showVoucherForm && selectedCampaign._id === campaign._id && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h5 className="text-lg font-semibold mb-4">Create New Voucher</h5>
                        <form onSubmit={handleVoucherSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="Voucher Code"
                              value={voucherForm.code}
                              onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value })}
                              className="px-4 py-2 border rounded-lg"
                              required
                            />
                            <select
                              value={voucherForm.type}
                              onChange={(e) => setVoucherForm({ ...voucherForm, type: e.target.value })}
                              className="px-4 py-2 border rounded-lg"
                            >
                              <option value="PERCENTAGE">Percentage</option>
                              <option value="AMOUNT">Fixed Amount</option>
                            </select>
                            <input
                              type="number"
                              placeholder="Value"
                              value={voucherForm.value}
                              onChange={(e) => setVoucherForm({ ...voucherForm, value: e.target.value })}
                              className="px-4 py-2 border rounded-lg"
                              required
                            />
                            <input
                              type="number"
                              placeholder="Max Limit"
                              value={voucherForm.maxLimit}
                              onChange={(e) => setVoucherForm({ ...voucherForm, maxLimit: e.target.value })}
                              className="px-4 py-2 border rounded-lg"
                            />
                            <input
                              type="number"
                              placeholder="Max Discount"
                              value={voucherForm.maxDiscount}
                              onChange={(e) => setVoucherForm({ ...voucherForm, maxDiscount: e.target.value })}
                              className="px-4 py-2 border rounded-lg"
                            />
                            <input
                              type="number"
                              placeholder="Max Usage Per User"
                              value={voucherForm.maxUsagePerUser}
                              onChange={(e) => setVoucherForm({ ...voucherForm, maxUsagePerUser: parseInt(e.target.value) })}
                              className="px-4 py-2 border rounded-lg"
                            />
                            <input
                              type="number"
                              placeholder="Total Usages"
                              value={voucherForm.totalUsages}
                              onChange={(e) => setVoucherForm({ ...voucherForm, totalUsages: parseInt(e.target.value) })}
                              className="px-4 py-2 border rounded-lg"
                            />
                            <input
                              type="datetime-local"
                              value={voucherForm.expirationDate}
                              onChange={(e) => setVoucherForm({ ...voucherForm, expirationDate: e.target.value })}
                              className="px-4 py-2 border rounded-lg"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Create Voucher
                            </button>
                            <button
                              type="button"
                              onClick={resetVoucherForm}
                              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Vouchers List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {campaign.vouchers?.map((voucher) => (
                        <div key={voucher._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold">{voucher.code}</h5>
                            <button
                              onClick={() => handleDeleteVoucher(voucher._id)}
                              className="text-red-600 hover:bg-red-50 p-1 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600">
                            {voucher.type === 'PERCENTAGE' ? `${voucher.value}% off` : `$${voucher.value} off`}
                          </p>
                          <p className="text-sm text-gray-600">
                            Uses: {voucher.currentUsage} / {voucher.totalUsages}
                          </p>
                          {voucher.maxDiscount && (
                            <p className="text-sm text-gray-600">Max Discount: ${voucher.maxDiscount}</p>
                          )}
                          <p className="text-sm text-gray-600">Status: {voucher.status}</p>
                          {voucher.expirationDate && (
                            <p className="text-sm text-gray-600">
                              Expires: {new Date(voucher.expirationDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(AdminDashboard, ['ADMIN']);