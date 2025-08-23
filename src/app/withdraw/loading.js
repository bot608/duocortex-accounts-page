import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Layout from '@/components/layout/Layout';

export default function Loading() {
  return (
    <Layout title="Withdraw Earnings">
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    </Layout>
  );
}