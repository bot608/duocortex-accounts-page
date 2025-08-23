'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function Signup() {
  const router = useRouter();

  return (
    <Layout title="Sign Up">
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">Join DuoCortex</h2>
            <p className="text-xl text-gray-600">Create your account</p>
          </div>

          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900">Account Creation</h3>
              <p className="text-gray-600">
                Account registration is currently handled through the DuoCortex mobile app. 
                Please download the mobile app to create your account.
              </p>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Already have an account?
                </p>
                <Button
                  onClick={() => router.push('/login')}
                  variant="primary"
                  className="w-full"
                >
                  Login to Your Account
                </Button>
                
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}