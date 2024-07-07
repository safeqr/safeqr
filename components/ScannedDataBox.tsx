import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import SecureWebView from './SecureWebView'; // Import the SecureWebView component

// Define Props for ScannedDataBox component
interface ScannedDataBoxProps {
  data: string;
  dataType: string;
  clearScanData: () => void;
}

// Define ScanResult interface
interface ScanResult {
  secureConnection: boolean;
  virusTotalCheck: boolean;
  redirects: number;
}

const ScannedDataBox: React.FC<ScannedDataBoxProps> = ({ data, dataType, clearScanData }) => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isWebViewVisible, setIsWebViewVisible] = useState(false); // State to control WebView modal visibility

  console.log("ScannedDataBox -> Data", data);
  console.log("DataType", dataType);

  // Set scan result based on data
  useEffect(() => {
    // Assuming scanResult is directly related to data
    setScanResult({
      secureConnection: data.includes('https'), // Example logic
      virusTotalCheck: !data.includes('danger'), // Example logic
      redirects: data.includes('redirect') ? 1 : 0, // Example logic
    });
    console.log("Scan result set:", scanResult);
  }, [data]);

  // Determine the result text based on scan result
  const getResultText = () => {
    if (!scanResult) {
      return 'UNKNOWN';
    }
    if (!scanResult.secureConnection && !scanResult.virusTotalCheck) {
      return 'DANGEROUS';
    } else if (scanResult.redirects > 0) {
      return 'WARNING';
    } else {
      return 'SAFE';
    }
  };

  // Determine the result color based on result text
  const getResultColor = () => {
    const result = getResultText();
    if (result === 'DANGEROUS') {
      return '#ff0000'; // Red
    } else if (result === 'WARNING') {
      return '#ffa500'; // Orange
    } else if (result === 'SAFE') {
      return '#44c167'; // Green
    } else {
      return '#000000'; // Black for unknown
    }
  };

  // Handle sharing the data
  const handleShare = async () => {
    try {
      await Share.share({
        message: data,
      });
      console.log('Data shared:', data);
    } catch (error) {
      console.error('Error sharing the data:', error);
    }
  };

  // Handle opening the data in a sandboxed WebView
  const handleOpen = () => {
    setIsWebViewVisible(true);
    console.log('Opening data in WebView:', data);
  };

  return (
    <View style={styles.dataBox}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={clearScanData}>
        <Ionicons name="close-circle-outline" size={18} color="#ff69b4" />
      </TouchableOpacity>
      
      {/* Display scanned data */}
      <View style={styles.row}>
        <Image source={require('../assets/ScanIcon3.png')} style={styles.scan_icon} />
        <Text style={styles.payload}>{data}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.timestampText}>{new Date().toLocaleString()}</Text>
      <View style={styles.qrContainer}>
        <QRCode value={data || 'No Data'} size={75} backgroundColor="transparent" />
        <Text style={[styles.resultText, { color: getResultColor() }]}>
          Result: {getResultText()}
        </Text>
      </View>
      <View style={styles.divider} />
      
      {/* Display data type */}
      <Text style={styles.typeText}>Type: {dataType}</Text>
      <Text style={styles.blankLine}>{'\n'}</Text>
      
      {/* Display scan checks */}
      <Text style={styles.checksText}>Checks</Text>
      <Text style={styles.checksText}>Secure Connection: {scanResult?.secureConnection ? '✔️' : '✘'}</Text>
      <Text style={styles.checksText}>Virus Total Check: {scanResult?.virusTotalCheck ? '✔️' : '✘'}</Text>
      <Text style={styles.checksText}>Redirects: {scanResult ? scanResult.redirects : 'N/A'}</Text>
      
      {/* Action buttons */}
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
          <Ionicons name="share-social" size={18} color="#2196F3" />
          <Text style={styles.iconText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleOpen}>
          <Ionicons name="open" size={18} color="#2196F3" />
          <Text style={styles.iconText}>Open</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      
      {/* More information button */}
      <Text style={styles.moreInfoText}>More Information</Text>
      <TouchableOpacity style={styles.moreInfoButton} onPress={() => setIsModalVisible(true)}>
        <Ionicons name="shield-checkmark" size={18} color="#ff69b4" />
        <Text style={styles.moreInfoButtonText}>Security Headers</Text>
        <Ionicons name="chevron-forward" size={18} color="#ff69b4" />
      </TouchableOpacity>
      
      {/* Modal for security headers */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Security Headers</Text>
            <Text style={styles.modalText}>Name: Strict-Transport-Security</Text>
            <Text style={styles.modalText}>Value: max-age=31536000; includeSubDomains</Text>
            <Text style={styles.modalText}>Name: X-Frame-Options</Text>
            <Text style={styles.modalText}>Value: DENY</Text>
            <Text style={styles.modalText}>Name: X-Content-Type-Options</Text>
            <Text style={styles.modalText}>Value: nosniff</Text>
            <Text style={styles.modalText}>Name: Content-Security-Policy</Text>
            <Text style={styles.modalText}>Value: default-src 'self'</Text>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for SecureWebView */}
      <Modal
        visible={isWebViewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsWebViewVisible(false)}
      >
        <View style={styles.webViewContainer}>
          <TouchableOpacity style={styles.closeWebViewButton} onPress={() => setIsWebViewVisible(false)}>
            <Ionicons name="close-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <SecureWebView url={data} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scan_icon: {
    width: 37.5,
    height: 37.5,
    marginRight: 6,
  },
  payload: {
    fontSize: 15,
    color: '#000',
    flex: 1,  // Allow text to use available space
  },
  dataBox: {
    padding: 15,
    backgroundColor: '#ffe6f0',
    borderRadius: 7.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.15,
    shadowRadius: 3.75,
    elevation: 2.25,
    zIndex: 1,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 7.5,
  },
  blankLine: {
    height: 15,
  },
  divider: {
    height: 0.75,
    backgroundColor: '#ddd',
    marginVertical: 7.5,
    alignSelf: 'stretch',
  },
  timestampText: {
    fontSize: 9,
    color: '#000',
    marginBottom: 7.5,
  },
  resultText: {
    fontSize: 12,
    marginBottom: 7.5,
    textAlign: 'center',
  },
  typeText: {
    fontSize: 12,
    color: '#000',
    marginBottom: 7.5,
  },
  checksText: {
    fontSize: 12,
    color: '#000',
    marginBottom: 3.75,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7.5,
  },
  iconButton: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  iconText: {
    color: '#2196F3',
    marginTop: 3.75,
    textAlign: 'center',
    fontSize: 12,
  },
  moreInfoText: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 7.5,
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7.5,
    paddingHorizontal: 11.25,
    backgroundColor: '#ffe6f0',
    borderRadius: 7.5,
    marginTop: 7.5,
  },
  moreInfoButtonText: {
    flex: 1,
    fontSize: 12,
    color: '#000',
    marginLeft: 7.5,
  },
  closeButton: {
    position: 'absolute',
    top: 7.5,
    right: 7.5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 7.5,
    padding: 15,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 7.5,
  },
  modalText: {
    fontSize: 12,
    marginBottom: 3.75,
    textAlign: 'left',
    width: '100%',
  },
  closeModalButton: {
    marginTop: 15,
    paddingVertical: 7.5,
    paddingHorizontal: 15,
    backgroundColor: '#ff69b4',
    borderRadius: 3.75,
  },
  closeModalButtonText: {
    fontSize: 12,
    color: '#fff',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  webView: {
    flex: 1,
    marginTop: 40,
  },
  closeWebViewButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
});

export default ScannedDataBox;
