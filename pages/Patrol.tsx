import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Company, Site, Area, Point, PatrolSession, PatrolStatus, ScanLog } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';
import SignaturePad from '../components/SignaturePad';
import { useToast } from '../contexts/ToastContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

declare const Html5Qrcode: any;

const QRScanner: React.FC<{
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}> = ({ onScanSuccess, onClose, addToast }) => {
    
  useEffect(() => {
    const html5QrcodeScanner = new Html5Qrcode("reader");
    let scannerRunning = true;

    const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
        if (scannerRunning) {
            scannerRunning = false;
            onScanSuccess(decodedText);
            html5QrcodeScanner.stop().catch(err => console.error("Failed to stop scanner", err));
        }
    };
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [] };

    html5QrcodeScanner.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, undefined)
      .catch((err: any) => {
        addToast('QR Scanner Error: ' + err, 'error');
        onClose();
      });

    return () => {
        if(scannerRunning) {
            html5QrcodeScanner.stop().catch((err: any) => {
                // This can throw an error if the scanner is already stopped, so we'll just log it.
                console.log("Scanner cleanup attempted.", err);
            });
        }
    };
  }, [onScanSuccess, onClose, addToast]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-xl w-full max-w-md relative">
        <h3 className="text-lg font-bold mb-4 text-center">Scan QR Code</h3>
        <div id="reader" className="w-full"></div>
        <button onClick={onClose} className="absolute top-2 right-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
            <XMarkIcon className="h-5 w-5"/>
        </button>
      </div>
    </div>
  );
};

const PatrolClock: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return <p><strong>Time:</strong> {currentTime.toLocaleTimeString()}</p>;
};


const Patrol: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();

    // Setup state
    const [companies, setCompanies] = useState<Company[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    const [points, setPoints] = useState<Point[]>([]);

    // Form state
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedSite, setSelectedSite] = useState('');
    const [selectedArea, setSelectedArea] = useState('');
    const [officerName, setOfficerName] = useState('');
    const [shift, setShift] = useState<'Day' | 'Night'>('Day');

    // Active patrol state
    const [activePatrol, setActivePatrol] = useState<PatrolSession | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Initial data fetch for companies
    useEffect(() => {
        api.getCompanies().then(setCompanies);
    }, []);

    // New Robust useEffect-based data fetching logic
    useEffect(() => {
        if (selectedCompany) {
            let isCancelled = false;
            api.getSites(selectedCompany).then(fetchedSites => {
                if (!isCancelled) setSites(fetchedSites);
            });
            return () => { isCancelled = true; };
        } else {
            setSites([]);
        }
    }, [selectedCompany]);

    useEffect(() => {
        if (selectedSite) {
            let isCancelled = false;
            api.getAreas(selectedSite).then(fetchedAreas => {
                if (!isCancelled) setAreas(fetchedAreas);
            });
            return () => { isCancelled = true; };
        } else {
            setAreas([]);
        }
    }, [selectedSite]);

    useEffect(() => {
        if (selectedArea) {
            let isCancelled = false;
            api.getPoints(selectedArea).then(fetchedPoints => {
                if (!isCancelled) setPoints(fetchedPoints);
            });
            return () => { isCancelled = true; };
        } else {
            setPoints([]);
        }
    }, [selectedArea]);

    // Simplified onChange handlers
    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCompany(e.target.value);
        setSelectedSite('');
        setSelectedArea('');
    };
    const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSite(e.target.value);
        setSelectedArea('');
    };
     const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedArea(e.target.value);
    };

    const autoSave = useCallback(async (patrol: PatrolSession) => {
        if (!patrol) return;
        await api.updatePatrol(patrol);
    }, []);
    
    useEffect(() => {
        const interval = setInterval(() => {
            if(activePatrol) {
                autoSave(activePatrol);
            }
        }, 30000); // Auto-save every 30 seconds
        return () => clearInterval(interval);
    }, [activePatrol, autoSave]);

    const handleStartPatrol = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!officerName || !selectedCompany || !selectedSite || !selectedArea) {
            addToast('Please fill all fields', 'error');
            return;
        }
        const newPatrol = await api.startPatrol({ officerName, companyId: selectedCompany, siteId: selectedSite, areaId: selectedArea, shift });
        setActivePatrol(newPatrol);
        addToast('Patrol started successfully!', 'success');
    };

    const handleScan = useCallback((scannedData: string) => {
        setIsScannerOpen(false);
        if (!activePatrol) return;

        try {
            const qrData = JSON.parse(scannedData);

            if (qrData.type !== 'patrol-point' || !qrData.pointId || !qrData.companyIdentifier || !qrData.siteIdentifier || !qrData.areaIdentifier) {
                addToast('Invalid or unrecognized QR code.', 'error');
                return;
            }

            // Find the full company/site/area objects from the component's state to get their custom IDs.
            const patrolCompany = companies.find(c => c.id === activePatrol.companyId);
            const patrolSite = sites.find(s => s.id === activePatrol.siteId);
            const patrolArea = areas.find(a => a.id === activePatrol.areaId);

            // Determine the correct identifier to validate against (custom ID first, then system ID).
            const expectedCompanyIdentifier = patrolCompany?.customId || patrolCompany?.id;
            const expectedSiteIdentifier = patrolSite?.customId || patrolSite?.id;
            const expectedAreaIdentifier = patrolArea?.customId || patrolArea?.id;
            
            // Validate the scanned identifiers against the expected identifiers for the active patrol.
            if (qrData.companyIdentifier !== expectedCompanyIdentifier) {
                addToast('Error: This point belongs to a different company.', 'error');
                return;
            }
            if (qrData.siteIdentifier !== expectedSiteIdentifier) {
                addToast('Error: This point belongs to a different site.', 'error');
                return;
            }
            if (qrData.areaIdentifier !== expectedAreaIdentifier) {
                addToast('Error: This point belongs to a different area.', 'error');
                return;
            }

            const pointId = qrData.pointId;
            const pointDetails = points.find(p => p.id === pointId);

            if (!pointDetails) {
                addToast('Scanned point not found in the current patrol area.', 'error');
                return;
            }
            
            if (activePatrol.scans.some(s => s.pointId === pointId)) {
                addToast(`${pointDetails.name} has already been scanned.`, 'info');
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newScan: ScanLog = {
                        id: `scan${Date.now()}`,
                        pointId,
                        pointName: pointDetails.name,
                        timestamp: new Date().toISOString(),
                        location: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        },
                    };
                    setActivePatrol(p => p ? { ...p, scans: [...p.scans, newScan] } : null);
                    addToast(`Scanned: ${newScan.pointName}`, 'success');
                },
                () => {
                    addToast('Could not get location. Scan aborted.', 'error');
                }
            );
        } catch (error) {
            addToast('Not a valid patrol QR code.', 'error');
            console.error("Error parsing QR code data:", error);
        }
    }, [activePatrol, points, addToast, companies, sites, areas]);

    const handleCloseScanner = useCallback(() => {
        setIsScannerOpen(false);
    }, []);

    const handleSignatureEnd = (signatureDataUrl: string) => {
        setActivePatrol(p => p ? { ...p, signatureDataUrl } : null);
    };
    
    const handleSubmitReport = async () => {
        if (!activePatrol) return;
        
        const totalPointsInArea = points.length;
        const uniqueScannedPoints = new Set(activePatrol.scans.map(s => s.pointId)).size;
        
        let status = PatrolStatus.Completed;
        if (uniqueScannedPoints < totalPointsInArea) {
            status = PatrolStatus.MissedPoints;
            addToast(`Report submitted with ${totalPointsInArea - uniqueScannedPoints} missed points.`, 'info');
        } else {
            addToast('Report submitted successfully!', 'success');
        }
        
        const finalPatrol = { ...activePatrol, endTime: new Date().toISOString(), status };
        await api.updatePatrol(finalPatrol);
        setActivePatrol(null);
        navigate('/reports');
    };
    
    if (activePatrol) {
        const scannedPointIds = new Set(activePatrol.scans.map(s => s.pointId));
        const coverage = points.length > 0 ? (scannedPointIds.size / points.length) * 100 : 0;

        return (
            <div>
                 <h1 className="text-2xl font-bold mb-4">Patrol in Progress</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card title="Patrol Log & Points">
                             <Button onClick={() => setIsScannerOpen(true)}>Scan QR Point</Button>
                             <div className="my-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                                {points.map(point => (
                                    <div key={point.id} className={`p-2 text-center rounded-lg text-sm ${scannedPointIds.has(point.id) ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                        {point.name}
                                    </div>
                                ))}
                             </div>
                             <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Scan Point</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Geo Location</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                                        {activePatrol.scans.map(scan => (
                                            <tr key={scan.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(scan.timestamp).toLocaleTimeString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{scan.pointName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{`${scan.location.latitude.toFixed(4)}, ${scan.location.longitude.toFixed(4)}`}</td>
                                            </tr>
                                        ))}
                                        {activePatrol.scans.length === 0 && (
                                            <tr><td colSpan={3} className="text-center py-4 text-gray-500">No scans yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                             </div>
                        </Card>
                         <Card title="Officer Sign-off">
                            <p className="text-sm mb-2 text-gray-600 dark:text-dark-text-secondary">Please sign below to confirm patrol completion.</p>
                            <SignaturePad onEnd={handleSignatureEnd} />
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card title="Session Info">
                            <p><strong>Officer:</strong> {activePatrol.officerName}</p>
                            <p><strong>Shift:</strong> {activePatrol.shift}</p>
                            <PatrolClock />
                        </Card>
                        <Card title="Patrol Progress">
                            <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2.5">
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${coverage}%` }}></div>
                            </div>
                            <p className="text-center mt-2">{scannedPointIds.size} of {points.length} points scanned ({coverage.toFixed(0)}%)</p>
                        </Card>
                        <Button onClick={handleSubmitReport} className="w-full" disabled={!activePatrol.signatureDataUrl}>Submit Report</Button>
                    </div>
                </div>
                {isScannerOpen && (
                    <QRScanner 
                        onScanSuccess={handleScan}
                        onClose={handleCloseScanner}
                        addToast={addToast}
                    />
                )}
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Start New Patrol</h1>
            <Card>
                <form onSubmit={handleStartPatrol} className="max-w-lg mx-auto space-y-4">
                    <Input label="Officer Name" value={officerName} onChange={e => setOfficerName(e.target.value)} required />
                     <Select label="Company" value={selectedCompany} onChange={handleCompanyChange} required>
                        <option value="">-- Select Company --</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                     <Select label="Site" value={selectedSite} onChange={handleSiteChange} disabled={!selectedCompany} required>
                        <option value="">-- Select Site --</option>
                        {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                    <Select label="Area" value={selectedArea} onChange={handleAreaChange} disabled={!selectedSite} required>
                        <option value="">-- Select Area --</option>
                        {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </Select>
                    <Select label="Shift" value={shift} onChange={e => setShift(e.target.value as 'Day' | 'Night')} required>
                        <option value="Day">Day</option>
                        <option value="Night">Night</option>
                    </Select>
                    <Button type="submit" className="w-full">Start Patrol</Button>
                </form>
            </Card>
        </div>
    );
};

export default Patrol;
