/// src/pages/Ajustes/styles.tsx
import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 0.5,
  },
  itemWrapper: {
    flex: 1,
    padding: 24,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    position: 'relative',
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldLabel: {
    fontWeight: 'bold',
    width: 100,          // ajustar conforme necessário
  },
  fieldValue: {
    flex: 1,
  },
  fieldText: {
    marginBottom: 6,
    lineHeight: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#0066ff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  icon: {
    
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#eee',
  },
  
  filterButtonActive: {
    backgroundColor: '#007bff',
  },
  
  filterText: {
    color: '#555',
    fontSize: 14,
  },
  
  filterTextActive: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
});
