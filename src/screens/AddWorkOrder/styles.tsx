import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    overflow: 'hidden',
  },
  buttonWrapper: {
    marginTop: 24,
  },
});
