import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import { PatrolSession, PatrolStatus } from '../types';
import api from '../services/api';
import Input from '../components/Input';
// FIX: Import the 'Button' component to resolve the 'Cannot find name' error.
import Button from '../components/Button';

const Reports: React.FC = () => {
    const [reports, setReports] = useState<PatrolSession[]>([]);
    const [selectedReport, setSelectedReport] = useState<PatrolSession | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            const data = await api.getReports();
            setReports(data.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
        };
        fetchReports();
    }, []);

    const filteredReports = useMemo(() => {
        return reports.filter(report =>
            report.officerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reports, searchTerm]);
    
    const getStatusBadge = (status: PatrolStatus) => {
        const base = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
        switch (status) {
            case PatrolStatus.Completed: return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
            case PatrolStatus.InProgress: return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
            case PatrolStatus.MissedPoints: return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
        }
    }
    
    const handlePrintReport = () => {
        window.print();
    };

    if (selectedReport) {
        return (
            <div>
                 <style>
                    {`
                        @media print {
                            body * { visibility: hidden; }
                            .print-area, .print-area * { visibility: visible; }
                            .print-area { position: absolute; left: 0; top: 0; width: 100%; }
                            .no-print { display: none; }
                        }
                    `}
                </style>
                <div className="no-print">
                    <button onClick={() => setSelectedReport(null)} className="mb-4 text-primary hover:underline">&larr; Back to Reports</button>
                    <Button onClick={handlePrintReport} className="float-right">Print Report</Button>
                </div>
                <div className="print-area">
                    <Card title={`Patrol Report - ${new Date(selectedReport.startTime).toLocaleDateString()}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold">Session Details</h4>
                                <p><strong>Officer:</strong> {selectedReport.officerName}</p>
                                <p><strong>Shift:</strong> {selectedReport.shift}</p>
                                <p><strong>Status:</strong> <span className={getStatusBadge(selectedReport.status)}>{selectedReport.status}</span></p>
                                <p><strong>Start Time:</strong> {new Date(selectedReport.startTime).toLocaleString()}</p>
                                <p><strong>End Time:</strong> {selectedReport.endTime ? new Date(selectedReport.endTime).toLocaleString() : 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="font-bold">Officer Signature</h4>
                                {selectedReport.signatureDataUrl ? <img src={selectedReport.signatureDataUrl} alt="Officer Signature" className="border rounded bg-white"/> : <p>No signature captured.</p>}
                            </div>
                        </div>
                        <div className="mt-6">
                            <h4 className="font-bold mb-2">Scan Audit Trail</h4>
                            <div className="overflow-x-auto">
                               <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Scan Point</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Geo Location</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                                        {selectedReport.scans.map(scan => (
                                            <tr key={scan.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{new Date(scan.timestamp).toLocaleTimeString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{scan.pointName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{`${scan.location.latitude.toFixed(4)}, ${scan.location.longitude.toFixed(4)}`}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Patrol Reports</h1>
            <Card>
                <div className="mb-4">
                    <Input label="Search by Officer Name" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="e.g., John Doe" />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Officer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Shift</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                            {filteredReports.map(report => (
                                <tr key={report.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{report.officerName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(report.startTime).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{report.shift}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className={getStatusBadge(report.status)}>{report.status}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setSelectedReport(report)} className="text-primary hover:text-primary-800">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Reports;
