
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BloodRequestCard from '@/components/BloodRequestCard';
import { BloodRequest } from '@/types/bloodTypes';

interface BloodRequestTabsProps {
  allRequests: BloodRequest[];
  pendingRequests: BloodRequest[];
  acceptedRequests: BloodRequest[];
  completedRequests: BloodRequest[];
  onCancelRequest: (requestId: string) => void;
  onViewDetails: (requestId: string) => void;
}

const BloodRequestTabs: React.FC<BloodRequestTabsProps> = ({
  allRequests,
  pendingRequests,
  acceptedRequests,
  completedRequests,
  onCancelRequest,
  onViewDetails,
}) => {
  const individualRequests = allRequests.filter(r => r.isIndividual);
  const groupRequests = allRequests.filter(r => !r.isIndividual);
  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-6">
        <TabsTrigger value="all">
          All
          <span className="ml-2 bg-gray-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {allRequests.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="pending">
          Pending
          <span className="ml-2 bg-yellow-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {pendingRequests.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="accepted">
          Accepted
          <span className="ml-2 bg-blue-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {acceptedRequests.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="completed">
          Completed
          <span className="ml-2 bg-green-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {completedRequests.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="individual">
          Individual
          <span className="ml-2 bg-purple-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {individualRequests.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="group">
          Group
          <span className="ml-2 bg-pink-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {groupRequests.length}
          </span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allRequests.slice(0, 6).map((request) => (
            <BloodRequestCard
              key={request.id}
              id={request.id}
              hospitalName={request.hospitalName}
              bloodType={request.bloodType}
              urgent={request.urgent}
              status={request.status}
              location={request.location}
              createdAt={request.createdAt}
              onCancel={() => onCancelRequest(request.id)}
              onView={() => onViewDetails(request.id)}
              showActionButtons={request.status === 'pending'}
            />
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="pending">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <BloodRequestCard
                key={request.id}
                id={request.id}
                hospitalName={request.hospitalName}
                bloodType={request.bloodType}
                urgent={request.urgent}
                status={request.status}
                location={request.location}
                createdAt={request.createdAt}
                onCancel={() => onCancelRequest(request.id)}
                onView={() => onViewDetails(request.id)}
              />
            ))
          ) : (
            <div className="col-span-3 bg-white rounded-lg p-6 text-center">
              <p className="text-gray-500">No pending requests</p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="accepted">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {acceptedRequests.length > 0 ? (
            acceptedRequests.map((request) => (
              <BloodRequestCard
                key={request.id}
                id={request.id}
                hospitalName={request.hospitalName}
                bloodType={request.bloodType}
                urgent={request.urgent}
                status={request.status}
                location={request.location}
                createdAt={request.createdAt}
                onView={() => onViewDetails(request.id)}
                showActionButtons={false}
              />
            ))
          ) : (
            <div className="col-span-3 bg-white rounded-lg p-6 text-center">
              <p className="text-gray-500">No accepted requests</p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="completed">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedRequests.length > 0 ? (
            completedRequests.map((request) => (
              <BloodRequestCard
                key={request.id}
                id={request.id}
                hospitalName={request.hospitalName}
                bloodType={request.bloodType}
                urgent={request.urgent}
                status={request.status}
                location={request.location}
                createdAt={request.createdAt}
                onView={() => onViewDetails(request.id)}
                showActionButtons={false}
              />
            ))
          ) : (
            <div className="col-span-3 bg-white rounded-lg p-6 text-center">
              <p className="text-gray-500">No completed requests</p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="individual">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {individualRequests.length > 0 ? (
            individualRequests.map((request) => (
              <BloodRequestCard
                key={request.id}
                id={request.id}
                hospitalName={request.hospitalName}
                bloodType={request.bloodType}
                urgent={request.urgent}
                status={request.status}
                location={request.location}
                createdAt={request.createdAt}
                onCancel={() => onCancelRequest(request.id)}
                onView={() => onViewDetails(request.id)}
              />
            ))
          ) : (
            <div className="col-span-3 bg-white rounded-lg p-6 text-center">
              <p className="text-gray-500">No individual requests</p>
            </div>
          )}
        </div>
      </TabsContent>
      <TabsContent value="group">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupRequests.length > 0 ? (
            groupRequests.map((request) => (
              <BloodRequestCard
                key={request.id}
                id={request.id}
                hospitalName={request.hospitalName}
                bloodType={request.bloodType}
                urgent={request.urgent}
                status={request.status}
                location={request.location}
                createdAt={request.createdAt}
                onCancel={() => onCancelRequest(request.id)}
                onView={() => onViewDetails(request.id)}
              />
            ))
          ) : (
            <div className="col-span-3 bg-white rounded-lg p-6 text-center">
              <p className="text-gray-500">No group requests</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default BloodRequestTabs;
