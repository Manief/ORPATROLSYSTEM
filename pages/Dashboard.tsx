import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Card from '../components/Card';
import api from '../services/api';
import { PatrolSession, PatrolStatus } from '../types';
import Button from '../components/Button';
import { ArrowRightIcon, BellIcon, BuildingLibraryIcon, MapPinIcon, QrCodeIcon, ShieldCheckIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const [recentPatrols, setRecentPatrols] = useState<PatrolSession[]>([]);
  const [isInitialSetup, setIsInitialSetup] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const dashboardData = await api.getDashboardStats();
      setRecentPatrols(dashboardData.recentPatrols);
      
      if (dashboardData.activeSites === 0) {
        setIsInitialSetup(true);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-gray-600 dark:text-dark-text-secondary">Welcome back! Here's an overview of your patrol operations.</p>
      </div>

      {isInitialSetup && (
        <Card className="bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <RocketLaunchIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-primary-800 dark:text-primary-200">Welcome to QR Patrol System!</h3>
              <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
                It looks like you're new here. Get started by setting up your first company and site.
              </p>
              <div className="mt-4">
                <NavLink to="/setup">
                  <Button variant="primary">Go to Setup <ArrowRightIcon className="ml-2 h-4 w-4" /></Button>
                </NavLink>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="Quick Actions" className="lg:col-span-1">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary">Get started with your daily tasks quickly and efficiently.</p>
            <NavLink to="/setup">
              <Button className="w-full">
                <QrCodeIcon className="h-5 w-5 mr-2" />
                Setup Patrol Points
              </Button>
            </NavLink>
            <NavLink to="/patrol">
              <Button className="w-full">
                <ArrowRightIcon className="h-5 w-5 mr-2" />
                Start a New Patrol
              </Button>
            </NavLink>
          </div>
        </Card>
        
        <Card title="Recent Activity" className="lg:col-span-2">
            <div className="flow-root">
                <ul role="list" className="-mb-8">
                    {recentPatrols.map((patrol, patrolIdx) => (
                        <li key={patrol.id}>
                            <div className="relative pb-8">
                                {patrolIdx !== recentPatrols.length - 1 ? (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-dark-border" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex space-x-3">
                                    <div>
                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-dark-card ${patrol.status === PatrolStatus.Completed ? 'bg-green-500' : 'bg-yellow-500'}`}>
                                            <ShieldCheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                                                Patrol by <span className="font-medium text-gray-900 dark:text-white">{patrol.officerName}</span> completed.
                                            </p>
                                        </div>
                                        <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-dark-text-secondary">
                                            <time dateTime={patrol.startTime}>{new Date(patrol.startTime).toLocaleDateString()}</time>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                    {recentPatrols.length === 0 && !isInitialSetup && <p className="text-gray-500 dark:text-dark-text-secondary">No recent patrols found.</p>}
                </ul>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;