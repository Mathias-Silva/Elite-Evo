import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },

  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 20, 
    alignItems: 'center',
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? 45 : 20 
  },
  logo: { 
    color: '#FFF', 
    fontSize: 20, 
    fontWeight: '900', 
    letterSpacing: -1 
  },
  headerIcons: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  cartBadgeContainer: { 
    position: 'relative' 
  },
  cartBadge: { 
    position: 'absolute', 
    top: -5, 
    right: -5, 
    backgroundColor: '#FF6B00', 
    borderRadius: 10, 
    width: 16, 
    height: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 10
  },
  cartBadgeText: { 
    color: '#FFF', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  
  
  heroSection: { 
    padding: 25, 
    backgroundColor: '#111', 
    margin: 20, 
    borderRadius: 20, 
    height: 250, 
    justifyContent: 'center' 
  },
  heroTitle: { 
    color: '#FFF', 
    fontSize: 28, 
    fontWeight: 'bold', 
    lineHeight: 34 
  },
  buttonPrimary: { 
    backgroundColor: '#FF6B00', 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    borderRadius: 30, 
    marginTop: 20, 
    alignSelf: 'flex-start' 
  },
  buttonText: { 
    color: '#FFF', 
    fontWeight: 'bold' 
  },

  
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    marginBottom: 15,
    alignItems: 'center',
    marginTop: 10
  },
  sectionTitle: { 
    color: '#FFF', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  viewAll: { 
    color: '#FF6B00', 
    fontSize: 14 
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },

  
  flatListContent: {
    paddingHorizontal: 10, 
    paddingBottom: 20
  },

  
 productCard: { 
    backgroundColor: '#121212', 
    flex: 1,                
    margin: 6,               
    borderRadius: 20,       
    padding: 10, 
    borderWidth: 1,
    borderColor: '#1A1A1A',
  
    maxWidth: (width / 2) - 16
  },
  
  tag: { 
    position: 'absolute', 
    top: 10, 
    left: 10, 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 8, 
    zIndex: 1 
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    padding: 4,
  },
  tagText: { 
    color: '#FFF', 
    fontSize: 9, 
    fontWeight: 'bold' 
  },
  imagePlaceholder: { 
    width: '100%', 
    height: 120, 
    backgroundColor: '#1A1A1A', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10 ,
    overflow: 'hidden'
  },
  productName: { 
    color: '#FFF', 
    fontSize: 14,
    fontWeight: 'bold' 
  },
  productFlavor: { 
    color: '#AAA', 
    fontSize: 11, 
    marginBottom: 8 
  },
  priceRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  productPrice: { 
    color: '#FF6B00', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  ratingBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#222', 
    padding: 4, 
    borderRadius: 6 
  },
  ratingText: { 
    color: '#FFB800', 
    fontSize: 10, 
    marginLeft: 3, 
    fontWeight: 'bold' 
  },
  addToCartBtn: { 
    backgroundColor: '#000', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 10, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#333' 
  },
  addToCartText: { 
    color: '#FFF', 
    marginLeft: 5, 
    fontSize: 12,
    fontWeight: '600' 
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  heartBtn: {
  position: 'absolute',
  right: 10,
  top: 10,
  zIndex: 10, 
  padding: 5, 
},
});