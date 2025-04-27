import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions
} from 'react-native';
import { t } from '@/locales';

interface AlertButtonProps {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButtonProps[];
  onDismiss: () => void;
}

export function CustomAlert({
  visible,
  title,
  message,
  buttons = [{ text: t('confirmClear.confirm'), onPress: () => {}, style: 'default' }],
  onDismiss
}: CustomAlertProps) {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  const handleButtonPress = (onPress: () => void) => {
    onPress();
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={() => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
      }}
      supportedOrientations={['landscape']}
    >
      <View style={styles.centeredView}>
        <View style={styles.alertView}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.messageText}>{message}</Text>
          
          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'destructive' && styles.destructiveButton,
                  button.style === 'cancel' && styles.cancelButton
                ]}
                onPress={() => handleButtonPress(button.onPress)}
              >
                <Text 
                  style={[
                    styles.buttonText,
                    button.style === 'destructive' && styles.destructiveButtonText
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertView: {
    width: Dimensions.get('window').width * 0.4,
    backgroundColor: '#FFF9C4',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    flex: 1,
    backgroundColor: '#FFECB3',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    margin: 5,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  destructiveButton: {
    backgroundColor: '#FFD1D1',
    borderColor: '#FF5252',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    borderColor: '#9E9E9E',
  },
  buttonText: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  destructiveButtonText: {
    color: '#D32F2F',
  },
}); 