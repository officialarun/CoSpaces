import { useState } from 'react';
import Head from 'next/head';
import { ProtectedRoute, useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/DashboardLayout';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { userAPI } from '../../lib/api';
import { FaUser, FaPhone, FaEnvelope, FaShieldAlt, FaGoogle } from 'react-icons/fa';

function ProfilePage() {
  const { user, loadUser } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      phone: user?.phone,
    }
  });
  const [loading, setLoading] = useState(false);
  const [phoneEdit, setPhoneEdit] = useState(false);

  const onSubmitProfile = async (data) => {
    setLoading(true);
    try {
      await userAPI.updateProfile(data);
      await loadUser();
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPhone = async (data) => {
    setLoading(true);
    try {
      await userAPI.updatePhone(data.phone);
      await loadUser();
      toast.success('Phone number updated!');
      setPhoneEdit(false);
    } catch (error) {
      toast.error(error.error || 'Failed to update phone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>My Profile - Account Settings</title>
      </Head>

      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

          {/* Account Type Badge */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.displayName} className="w-20 h-20 rounded-full" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                    {user?.firstName?.[0] || user?.email?.[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{user?.displayName}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  {user?.authProvider === 'google' && (
                    <div className="flex items-center gap-2 mt-1">
                      <FaGoogle className="text-red-500" />
                      <span className="text-sm text-gray-500">Signed in with Google</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`badge ${
                  user?.role === 'admin' ? 'badge-error' :
                  user?.role === 'compliance_officer' ? 'badge-warning' :
                  user?.role === 'asset_manager' ? 'badge-info' :
                  'badge-success'
                }`}>
                  {user?.role?.replace('_', ' ').toUpperCase()}
                </span>
                <p className="text-sm text-gray-500 mt-1 capitalize">{user?.userType}</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Personal Information</h3>
            <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    {...register('firstName', { required: 'First name is required' })}
                    type="text"
                    className="input"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    {...register('lastName', { required: 'Last name is required' })}
                    type="text"
                    className="input"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Contact Information</h3>
            
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-gray-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                {user?.isEmailVerified ? (
                  <span className="badge badge-success">Verified</span>
                ) : (
                  <button className="text-primary-600 hover:text-primary-700 text-sm">
                    Verify Email
                  </button>
                )}
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <FaPhone className="text-gray-400 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Phone</p>
                    {phoneEdit ? (
                      <form onSubmit={handleSubmit(onSubmitPhone)} className="flex gap-2 mt-1">
                        <input
                          {...register('phone', { required: 'Phone is required' })}
                          type="tel"
                          className="input"
                          placeholder="+91 9876543210"
                        />
                        <button type="submit" className="btn-primary text-sm">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhoneEdit(false)}
                          className="btn-secondary text-sm"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <p className="font-medium">{user?.phone || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                {!phoneEdit && (
                  <div className="flex items-center gap-2">
                    {user?.isPhoneVerified ? (
                      <span className="badge badge-success">Verified</span>
                    ) : user?.phone ? (
                      <button className="text-primary-600 hover:text-primary-700 text-sm">
                        Verify
                      </button>
                    ) : null}
                    {!user?.phone && (
                      <button
                        onClick={() => setPhoneEdit(true)}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        Add Phone
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KYC Status */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaShieldAlt className="text-primary-600 text-2xl" />
                <div>
                  <h3 className="text-xl font-bold">KYC Verification</h3>
                  <p className="text-sm text-gray-600">
                    Status: <span className={`font-medium ${
                      user?.kycStatus === 'approved' ? 'text-green-600' :
                      user?.kycStatus === 'rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {user?.kycStatus?.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
              <a href="/kyc/status" className="btn-outline">
                View KYC Status
              </a>
            </div>
          </div>

          {/* Security */}
          {user?.authProvider === 'local' && (
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Security</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-gray-600">Update your password</p>
                    </div>
                    <span className="text-primary-600">→</span>
                  </div>
                </button>
                <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">
                        {user?.mfaEnabled ? 'Enabled' : 'Add an extra layer of security'}
                      </p>
                    </div>
                    <span className={`badge ${user?.mfaEnabled ? 'badge-success' : 'badge-warning'}`}>
                      {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}

