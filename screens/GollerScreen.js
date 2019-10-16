import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,Button,
  View,ScroolView,SafeAreaView,Dimensions,TouchableHighlight,Linking,ActivityIndicator
} from 'react-native';
import { WebBrowser,DangerZone,PublisherBanner,MapView , Location, Permissions,Constants,AdMobInterstitial } from 'expo';
const { Lottie } = DangerZone;
import { MonoText } from '../components/StyledText';
import { Ionicons,FontAwesome } from '@expo/vector-icons';
import SwipeUpDown from 'react-native-swipe-up-down';
// Using a local version here because we need it to import MapView from 'expo'
import MapViewDirections from '../screens/MapViewDirections';
import Lightbox from 'react-native-lightbox';
import TimerMixin from 'react-timer-mixin';
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 39.878582;
const LONGITUDE = 41.269779;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const GOOGLE_MAPS_APIKEY = 'AIzaSyCYvMpmVhFc0ydILEuXGJNYNGFnBoKPCL8';
console.disableYellowBox = true;
export default class GollerScreen extends React.Component {
  static navigationOptions = {
    header: null,
   
  };
  constructor(props) {
    super(props);
    this.state = {
        animation:null,
        footer:110,
        location: null,
        mesafe:null,
        dakika:null,
        sayac:0,
        bekle:false,
        maksimum_sicaklik:null,
        minimum_sicaklik:null,
        medrese_adi:'Tortum Gölü',
        coordinates: [
          {
            latitude: 39.9066046,
            longitude: 41.271480,
          },
          {
            latitude: 40.649117,
            longitude: 41.641607,
          },
        ],
    };
    this.mapView = null;
  }

  componentDidMount() {
    //this._playAnimation();
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      
     
     fetch('http://dataservice.accuweather.com/forecasts/v1/daily/1day/317825?apikey=xBIquGHJ9jMx2NAGi7vpgitWSEG77XGz')
        .then((response) => response.json())
        .then((responseJson) => {
          var maksimum=(responseJson.DailyForecasts["0"].Temperature.Maximum.Value-32)*5/9;
          var minimum=(responseJson.DailyForecasts["0"].Temperature.Minimum.Value-32)*5/9;
          maksimum=Math.ceil(maksimum);
          minimum=Math.ceil(minimum);
          this.setState({
            maksimum_sicaklik:maksimum,
            minimum_sicaklik:minimum
          })

        })
        .catch((error) => {
          console.error(error);
        });
      
    }
    this.setState({
      bekle:true

    })
    setInterval(() => {
      
      this._getLocationAsync();
      this.setState({
        bekle:false
      })
    }, 5000)
  }
  reklam_ =async()=>{
    AdMobInterstitial.setAdUnitID('ca-app-pub-3940256099942544/8691691433'); // Test ID, Replace with your-admob-unit-id
    AdMobInterstitial.setTestDeviceID('EMULATOR');
    await AdMobInterstitial.requestAdAsync();
    await AdMobInterstitial.showAdAsync();
  }
  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
    this.setState({
      coordinates:[
        {
         
          latitude:parseFloat(this.state.location.coords.latitude),
          longitude:parseFloat(this.state.location.coords.longitude)
        },{
            latitude:this.state.coordinates[1].latitude,
            longitude:this.state.coordinates[1].longitude
        }
       
      ]
    })
    this.hesapla(this.state.coordinates[0].latitude,this.state.coordinates[0].longitude,this.state.coordinates[1].latitude,this.state.coordinates[1].longitude);

    
   
    

    
  };
  _playAnimation = () => {
    if (!this.state.animation) {
      this._loadAnimationAsync();
    } else {
      this.animation.reset();
      this.animation.play();
    }
  };

  _loadAnimationAsync = async () => {
    let result = await fetch(
      'http://www.agrupsigorta.com/loading.json'
    )
      .then(data => {
        return data.json();
      })
      .catch(error => {
      });
    this.setState({ animation: result }, this._playAnimation);
  };
	onMapPress = (e) => {
		if (this.state.coordinates.length == 2) {
			this.setState({
				coordinates: [
					e.nativeEvent.coordinate,
				],
			});
		} else {
			this.setState({
				coordinates: [
					...this.state.coordinates,
					e.nativeEvent.coordinate,
				],
			});
		}
	}

	onReady = (result) => {
		this.mapView.fitToCoordinates(result.coordinates, {
			edgePadding: {
        right: (width / 20),
        
				bottom: (height / 20),
				left: (width / 20),
				top: (height / 20),
			}
		});
	}
  hesapla=async(lat1,lon1,lat2,lon2)=>{
    var R = 6371e3; // metres
    var φ1 = lat1*Math.PI/180;
    var φ2 = lat2*Math.PI/180;
    var Δφ = (lat2-lat1)*Math.PI/180;
    var Δλ = (lon2-lon1)*Math.PI/180;
    
    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    var d = R * c/1000;
    d=d.toFixed(1);
    if (d>1) {
      this.setState({mesafe:d+" Km"})
      var dakika=d/20*60;
      var dakika=Math.ceil(dakika);
      this.setState({dakika:dakika})
     
    }
    else if (d<=1) {
      d=d*1000;
      this.setState({mesafe:d+" Metre"})
      var dakika=d/10*60/1000;
      var dakika=Math.ceil(dakika);
      this.setState({dakika:dakika})
    } 
    
  }
	onError = (errorMessage) => {
		
  }
  _reklam_site =async () => {
    WebBrowser.openBrowserAsync('https://www.dedeman.com/TR/7-Oteller/278-Dedeman-Palandoken/');
  };
  tortumgol = async () =>{
    this.setState({
        medrese_adi:'Tortum Gölü',
        bekle:true,
        coordinates:[
            {
                latitude:this.state.coordinates[0].latitude,
                longitude:this.state.coordinates[0].longitude
            },
          {
       
            latitude: 40.649117,
            longitude: 41.641607,
          }
        ]
      })
      //this._getLocationAsync();
      this.swipeUpDownRef.showFull()
  }
  ispir7goller = async () =>{
    this.setState({
        medrese_adi:'İspir YediGöller',
        bekle:true,
        coordinates:[
            {
                latitude:this.state.coordinates[0].latitude,
                longitude:this.state.coordinates[0].longitude
            },
          {
       
            latitude: 40.646878,
            longitude: 41.881686,
          }
        ]
      })
      //this._getLocationAsync();
      this.swipeUpDownRef.showFull()
  }
  narman5goller = async () =>{
    this.setState({
        medrese_adi:'Narman BeşGöller',
        bekle:true,
        coordinates:[
            {
                latitude:this.state.coordinates[0].latitude,
                longitude:this.state.coordinates[0].longitude
            },
          {
       
            latitude: 40.263744,
            longitude: 41.942959,
          }
        ]
      })
      //this._getLocationAsync();
      this.swipeUpDownRef.showFull()
  }
  
 
  render() {
   if(this.state.bekle){
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={{flex:0.2,justifyContent:'flex-start',alignItems: 'flex-start',marginLeft:30}}  onPress={()=>this.props.navigation.openDrawer()}>
              <Ionicons name="ios-menu" size={30} color="white" />
            </TouchableOpacity>
            <Text style={{color:'white',fontSize:28,flex:1,fontFamily:'baslik1',marginTop:Platform.OS === 'ios' ? 0 : -20}}>Erzurum Gezi Rehberi</Text>
          </View>
          <View style={styles.sekil}>
          <Text style={{fontWeight:'bold',fontFamily:'space-mono',textAlign:'center',color:'grey'}}>Damlaya damlaya göl olur.</Text>
          </View>
        </View>
              
       <ScrollView >
       <View style={{flex:1,marginTop:200,width:'98%',justifyContent:'center',alignItems:'center'}}>
        <Text style={{fontFamily:'baslik',fontSize:25,color:'gray'}} onPress={this.cifte}>Tortum Gölü</Text>
        <Text></Text>
        <Text style={{fontFamily:'space-mono',fontSize:12,color:'#b5b5b5',textAlign:'center'}}>
        Tortum Gölü, Tortum ilçesinin 35 km kuzeyinde, Erzurum-Artvin yolu üzerinde yer alır. Yaklaşık 18. yüzyılda Kemerli Dağ’dan inen bir heyelan kütlesinin Tortum Çayı’nın önünü kapaması sonucu oluşan göl, Tortum Çayı üzerinde dar ve dik bir vadide 8 km boyunca uzanır. Oluşum şekli nedeniyle burada bir göl çanağı ve doğal baraj oluşmuştur. Gölün fazla suları, bu doğal seti aşarak Tev Vadisi’ne döküldüğü yerde Tortum Şelalesi’ni oluşturmaktadır. 

Tortum Gölü'nün güney ucunda küçük bir kuş cenneti vardır. Yırtıcı kuşların uğrak yeri olan gölün bulunduğu vadide, Türkiye'nin dört akbaba türünü de görmek mümkündür. Ayrıca kafes balıkçılığı yapılabilen gölde, alabalık ve aynalı sazan üretilmektedir.

Dört tarafı yüksek tepelerle çevrilmiş, dar ve derin bir göl olan Tortum Gölü’nde mesire alanları da mevcuttur. Balıklı Köyü yakınında ve göle uzanan yarımada ile gölün çevresindeki ağaçlı alanlar mesire yeri olarak kullanılmaktadır. Balıklı Köyü önlerinde göle doğru uzanan Bozburun Yarımadası turistlerin önemli uğrak yerlerinden biridir.

Gölün karşı kıyısında elma ve kayısı bahçeleri yer almaktadır. Gölün doğu kıyılarını peri bacaları süslerken, batı yamaçlarında çok dik ve kayalık bir yapı göze çarpmaktadır. Gölde, Ayvalı ve Küçük adında iki ada bulunmaktadır. Oldukça sakin olan gölün üzerinde sandalla gezinti yapmak mümkündür. 
        </Text>
        <Text style={{fontFamily:'baslik1',fontSize:15,color:'gray',marginTop:15}} onPress={this.tortumgol}>Yol tarifi için tıklayın...</Text>

        <Lightbox underlayColor="white">
          <Image
            style={{marginTop: 30,
              height: 300,
            width:width,justifyContent:'center',alignItems:'center',shadowColor: '#000',
            shadowOffset: { width: 2, height: 9 },
            shadowOpacity: 0.4,
            shadowRadius: 2,}}
            resizeMode="contain"
            source={{uri: 'http://galeri.netfotograf.com/images/medium/2E09A5352DE680E0.jpg'}}
          />
        </Lightbox>
        <View style={styles.reklam}>
            <PublisherBanner
              bannerSize="largeBanner"
              adUnitID="ca-app-pub-5888738492049923/7163419742" // Test ID, Replace with your-admob-unit-id
              testDeviceID="EMULATOR"
              onDidFailToReceiveAdWithError={this.bannerError}
              onAdMobDispatchAppEvent={this.adMobEvent} />
              </View>


                 <Text style={{fontFamily:'baslik',fontSize:25,color:'gray',marginTop:50,textAlign:'center'}} >İspir YediGöller</Text>
        <Text></Text>
        <Text style={{fontFamily:'space-mono',fontSize:12,color:'#b5b5b5',textAlign:'center'}}>
        İspir Yedigöller Türkiye'nin bakir coğrafyalarından Ovit Dağı'nın güney yamaçları, volkanik gölleriyle mutlaka keşfedilmesi gereken bir bölgedir. Burada dağların yüksekliği zaman zaman 4000 metreyi bulurken, küçüklü büyüklü tepeler arasında turkuaz renkli volkanik göller yer almaktadır. Değişik boyutlarda 11 gölden oluşan Yedigöller'e otomobille gitmek mümkün değildir. Ancak uygun bir arazi aracıyla, stabilize yollardan göllere ulaşılabilmektedir. Dağcıların gözde mekanı olan Yedigöller'e gelmek için en iyi zaman, haziran ayının on beşinden sonrası ve ağustos ayının sonlarıdır.              

        </Text>


        <Text style={{fontFamily:'baslik1',fontSize:15,color:'gray',marginTop:15}} onPress={this.ispir7goller}>Yol tarifi için tıklayın...</Text>
        <Lightbox underlayColor="white">
          <Image
            style={{marginTop: 30,
              height: 300,
            width:width,justifyContent:'center',alignItems:'center',shadowColor: '#000',
            shadowOffset: { width: 2, height: 9 },
            shadowOpacity: 0.4,
            shadowRadius: 2,}}
            resizeMode="contain"
            source={{uri: 'http://www.erzurumkulturturizm.gov.tr/Resim/192794,ispir-yedigoller.png?0'}}
          />
        </Lightbox>
       
              <View style={styles.reklam}>
            <PublisherBanner
              bannerSize="largeBanner"
              adUnitID="ca-app-pub-5888738492049923/6971848050" // Test ID, Replace with your-admob-unit-id
              testDeviceID="EMULATOR"
              onDidFailToReceiveAdWithError={this.bannerError}
              onAdMobDispatchAppEvent={this.adMobEvent} />
              </View>


                 <Text style={{fontFamily:'baslik',fontSize:25,color:'gray',marginTop:50,textAlign:'center'}} >Narman BeşGöller</Text>
        <Text></Text>
        <Text style={{fontFamily:'space-mono',fontSize:12,color:'#b5b5b5',textAlign:'center'}}>
        Narman Beş Göller Erzurum'a 121 Narman'a 25 km uzaklıkta bulunmaktadır. Değişik büyüklüklerde beş gölden oluşur. Eşsiz doğal güzellikleri ile keşfedilmesi gereken, bakir bir alan olan bölge, Narman İlçesinin güneyinde otlutepe mahallesi (köyü) yaylasına 2 km mesafede bulunmaktadır. Kamp ve Trekking için uygun olan beş göllere gitmek için en uygun zaman yaz aylarıdır.
        </Text>


        <Text style={{fontFamily:'baslik1',fontSize:15,color:'gray',marginTop:15}} onPress={this.narman5goller}>Yol tarifi için tıklayın...</Text>
        <Lightbox underlayColor="white">
          <Image
            style={{marginTop: 30,
              height: 300,
            width:width,justifyContent:'center',alignItems:'center',shadowColor: '#000',
            shadowOffset: { width: 2, height: 9 },
            shadowOpacity: 0.4,
            shadowRadius: 2,}}
            resizeMode="contain"
            source={{uri: 'https://www.kulturportali.gov.tr/Common/GetFoto.aspx?f=MjAxODAzMTkxMTEwNDM4NjdfMS5wbmc%3D&d=U2VoaXJSZWhiZXJpXFxHZXppbGVjZWtZZXJc&s=c21hbGw%3D'}}
          />
        </Lightbox>
        <View style={styles.reklam}>
            <PublisherBanner
              bannerSize="largeBanner"
              adUnitID="ca-app-pub-5888738492049923/8479660408" // Test ID, Replace with your-admob-unit-id
              testDeviceID="EMULATOR"
              onDidFailToReceiveAdWithError={this.bannerError}
              onAdMobDispatchAppEvent={this.adMobEvent} />
              </View>
             
        <View style={{marginTop:150}}></View>
        </View>
        </ScrollView>
        <SwipeUpDown	
        hasRef={ref => (this.swipeUpDownRef = ref)}	
    itemMini={
     
            <View style={{justifyContent:'center',alignItems:'center'}}>
           <View style={{width:'20%',height:10,borderRadius:40,backgroundColor:'gray',marginTop:0}}>
            </View>
       
           
       </View>} // Pass props component when collapsed
    itemFull={  <View style={styles.container1}>
    <MapView
      initialRegion={{
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }}
      style={[StyleSheet.absoluteFill,{borderRadius:35,height:250,backgroundColor:'white'}]}
      ref={c => this.mapView = c} // eslint-disable-line react/jsx-no-bind
      onPress={this.onMapPress}
      loadingEnabled={true}
    >
      {this.state.coordinates.map((coordinate, index) =>
        <MapView.Marker key={`coordinate_${index}`} coordinate={coordinate} /> // eslint-disable-line react/no-array-index-key
      )}
      {(this.state.coordinates.length === 2) && (
        <MapViewDirections
          origin={this.state.coordinates[0]}
          destination={this.state.coordinates[1]}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={3}
          strokeColor="#1da1f2"
          onReady={this.onReady}
          onError={this.onError}
        />
      )}
    
    </MapView>
    <ActivityIndicator size="small" color="black" animating={true} />

  </View>} // Pass props component when show full
    animation="spring" 
  
    swipeHeight={Platform.OS === 'ios' ? 80 : 60}
    disablePressToShow={true} // Press item mini to show full
    style={{ backgroundColor: '#F2F2F2',borderTopLeftRadius:55,borderTopRightRadius:55,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,

    elevation: 24,zIndex:2000}} // style for swipe
/>

      </View>
    );


   }else{
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={{flex:0.2,justifyContent:'flex-start',alignItems: 'flex-start',marginLeft:30}}  onPress={()=>this.props.navigation.openDrawer()}>
              <Ionicons name="ios-menu" size={30} color="white" />
            </TouchableOpacity>
            <Text style={{color:'white',fontSize:28,flex:1,fontFamily:'baslik1',marginTop:Platform.OS === 'ios' ? 0 : -20}}>Erzurum Gezi Rehberi</Text>
          </View>
          <View style={styles.sekil}>
          <Text style={{fontWeight:'bold',fontFamily:'space-mono',textAlign:'center',color:'grey'}}>Damlaya damlaya göl olur.</Text>
          </View>
        </View>
              
       <ScrollView >
       <View style={{flex:1,marginTop:200,width:'98%',justifyContent:'center',alignItems:'center'}}>
        <Text style={{fontFamily:'baslik',fontSize:25,color:'gray'}} onPress={this.cifte}>Tortum Gölü</Text>
        <Text></Text>
        <Text style={{fontFamily:'space-mono',fontSize:12,color:'#b5b5b5',textAlign:'center'}}>
        Tortum Gölü, Tortum ilçesinin 35 km kuzeyinde, Erzurum-Artvin yolu üzerinde yer alır. Yaklaşık 18. yüzyılda Kemerli Dağ’dan inen bir heyelan kütlesinin Tortum Çayı’nın önünü kapaması sonucu oluşan göl, Tortum Çayı üzerinde dar ve dik bir vadide 8 km boyunca uzanır. Oluşum şekli nedeniyle burada bir göl çanağı ve doğal baraj oluşmuştur. Gölün fazla suları, bu doğal seti aşarak Tev Vadisi’ne döküldüğü yerde Tortum Şelalesi’ni oluşturmaktadır. 

Tortum Gölü'nün güney ucunda küçük bir kuş cenneti vardır. Yırtıcı kuşların uğrak yeri olan gölün bulunduğu vadide, Türkiye'nin dört akbaba türünü de görmek mümkündür. Ayrıca kafes balıkçılığı yapılabilen gölde, alabalık ve aynalı sazan üretilmektedir.

Dört tarafı yüksek tepelerle çevrilmiş, dar ve derin bir göl olan Tortum Gölü’nde mesire alanları da mevcuttur. Balıklı Köyü yakınında ve göle uzanan yarımada ile gölün çevresindeki ağaçlı alanlar mesire yeri olarak kullanılmaktadır. Balıklı Köyü önlerinde göle doğru uzanan Bozburun Yarımadası turistlerin önemli uğrak yerlerinden biridir.

Gölün karşı kıyısında elma ve kayısı bahçeleri yer almaktadır. Gölün doğu kıyılarını peri bacaları süslerken, batı yamaçlarında çok dik ve kayalık bir yapı göze çarpmaktadır. Gölde, Ayvalı ve Küçük adında iki ada bulunmaktadır. Oldukça sakin olan gölün üzerinde sandalla gezinti yapmak mümkündür. 
        </Text>
        <Text style={{fontFamily:'baslik1',fontSize:15,color:'gray',marginTop:15}} onPress={this.tortumgol}>Yol tarifi için tıklayın...</Text>

        <Lightbox underlayColor="white">
          <Image
            style={{marginTop: 30,
              height: 300,
            width:width,justifyContent:'center',alignItems:'center',shadowColor: '#000',
            shadowOffset: { width: 2, height: 9 },
            shadowOpacity: 0.4,
            shadowRadius: 2,}}
            resizeMode="contain"
            source={{uri: 'http://galeri.netfotograf.com/images/medium/2E09A5352DE680E0.jpg'}}
          />
        </Lightbox>
        <View style={styles.reklam}>
            <PublisherBanner
              bannerSize="largeBanner"
              adUnitID="ca-app-pub-5888738492049923/7163419742" // Test ID, Replace with your-admob-unit-id
              testDeviceID="EMULATOR"
              onDidFailToReceiveAdWithError={this.bannerError}
              onAdMobDispatchAppEvent={this.adMobEvent} />
              </View>


                 <Text style={{fontFamily:'baslik',fontSize:25,color:'gray',marginTop:50,textAlign:'center'}} >İspir YediGöller</Text>
        <Text></Text>
        <Text style={{fontFamily:'space-mono',fontSize:12,color:'#b5b5b5',textAlign:'center'}}>
        İspir Yedigöller Türkiye'nin bakir coğrafyalarından Ovit Dağı'nın güney yamaçları, volkanik gölleriyle mutlaka keşfedilmesi gereken bir bölgedir. Burada dağların yüksekliği zaman zaman 4000 metreyi bulurken, küçüklü büyüklü tepeler arasında turkuaz renkli volkanik göller yer almaktadır. Değişik boyutlarda 11 gölden oluşan Yedigöller'e otomobille gitmek mümkün değildir. Ancak uygun bir arazi aracıyla, stabilize yollardan göllere ulaşılabilmektedir. Dağcıların gözde mekanı olan Yedigöller'e gelmek için en iyi zaman, haziran ayının on beşinden sonrası ve ağustos ayının sonlarıdır.              

        </Text>


        <Text style={{fontFamily:'baslik1',fontSize:15,color:'gray',marginTop:15}} onPress={this.ispir7goller}>Yol tarifi için tıklayın...</Text>
        <Lightbox underlayColor="white">
          <Image
            style={{marginTop: 30,
              height: 300,
            width:width,justifyContent:'center',alignItems:'center',shadowColor: '#000',
            shadowOffset: { width: 2, height: 9 },
            shadowOpacity: 0.4,
            shadowRadius: 2,}}
            resizeMode="contain"
            source={{uri: 'http://www.erzurumkulturturizm.gov.tr/Resim/192794,ispir-yedigoller.png?0'}}
          />
        </Lightbox>
       
              <View style={styles.reklam}>
            <PublisherBanner
              bannerSize="largeBanner"
              adUnitID="ca-app-pub-5888738492049923/6971848050" // Test ID, Replace with your-admob-unit-id
              testDeviceID="EMULATOR"
              onDidFailToReceiveAdWithError={this.bannerError}
              onAdMobDispatchAppEvent={this.adMobEvent} />
              </View>


                 <Text style={{fontFamily:'baslik',fontSize:25,color:'gray',marginTop:50,textAlign:'center'}} >Narman BeşGöller</Text>
        <Text></Text>
        <Text style={{fontFamily:'space-mono',fontSize:12,color:'#b5b5b5',textAlign:'center'}}>
        Narman Beş Göller Erzurum'a 121 Narman'a 25 km uzaklıkta bulunmaktadır. Değişik büyüklüklerde beş gölden oluşur. Eşsiz doğal güzellikleri ile keşfedilmesi gereken, bakir bir alan olan bölge, Narman İlçesinin güneyinde otlutepe mahallesi (köyü) yaylasına 2 km mesafede bulunmaktadır. Kamp ve Trekking için uygun olan beş göllere gitmek için en uygun zaman yaz aylarıdır.
        </Text>


        <Text style={{fontFamily:'baslik1',fontSize:15,color:'gray',marginTop:15}} onPress={this.narman5goller}>Yol tarifi için tıklayın...</Text>
        <Lightbox underlayColor="white">
          <Image
            style={{marginTop: 30,
              height: 300,
            width:width,justifyContent:'center',alignItems:'center',shadowColor: '#000',
            shadowOffset: { width: 2, height: 9 },
            shadowOpacity: 0.4,
            shadowRadius: 2,}}
            resizeMode="contain"
            source={{uri: 'https://www.kulturportali.gov.tr/Common/GetFoto.aspx?f=MjAxODAzMTkxMTEwNDM4NjdfMS5wbmc%3D&d=U2VoaXJSZWhiZXJpXFxHZXppbGVjZWtZZXJc&s=c21hbGw%3D'}}
          />
        </Lightbox>
        <View style={styles.reklam}>
            <PublisherBanner
              bannerSize="largeBanner"
              adUnitID="ca-app-pub-5888738492049923/8479660408" // Test ID, Replace with your-admob-unit-id
              testDeviceID="EMULATOR"
              onDidFailToReceiveAdWithError={this.bannerError}
              onAdMobDispatchAppEvent={this.adMobEvent} />
              </View>
             
        <View style={{marginTop:150}}></View>
        </View>
        </ScrollView>
        <SwipeUpDown	
        hasRef={ref => (this.swipeUpDownRef = ref)}	
    itemMini={
     
            <View style={{justifyContent:'center',alignItems:'center'}}>
           <View style={{width:'20%',height:10,borderRadius:40,backgroundColor:'gray',marginTop:0}}>
            </View>
       
           
       </View>} // Pass props component when collapsed
    itemFull={  <View style={styles.container1}>
    <MapView
      initialRegion={{
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }}
      style={[StyleSheet.absoluteFill,{borderRadius:35,height:250,backgroundColor:'white'}]}
      ref={c => this.mapView = c} // eslint-disable-line react/jsx-no-bind
      onPress={this.onMapPress}
      loadingEnabled={true}
    >
      {this.state.coordinates.map((coordinate, index) =>
        <MapView.Marker key={`coordinate_${index}`} coordinate={coordinate} /> // eslint-disable-line react/no-array-index-key
      )}
      {(this.state.coordinates.length === 2) && (
        <MapViewDirections
          origin={this.state.coordinates[0]}
          destination={this.state.coordinates[1]}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={3}
          strokeColor="#1da1f2"
          onReady={this.onReady}
          onError={this.onError}
        />
      )}
    
    </MapView>
    <View style={{flexDirection:'row',marginTop:200}}>
      <View style={{flexDirection:'column',marginLeft:Platform.OS === 'ios' ? 0 : 0,marginTop:Platform.OS === 'ios' ? 0 : -15}}>
          <Text style={{fontSize:Platform.OS === 'ios' ? 35 : 20,fontFamily:'baslik1',color:'gray',marginTop:5}}>{this.state.mesafe}</Text>
          <Text style={{fontSize:Platform.OS === 'ios' ? 25 : 15,fontFamily:'baslik1',color:'gray',marginTop:Platform.OS === 'ios' ? 5 : -5}}  >{this.state.dakika} Dakika</Text>
          <Text style={{fontSize:Platform.OS === 'ios' ? 20 : 15,fontFamily:'baslik1',color:'gray',marginTop:Platform.OS === 'ios' ? 5 : -5}} >{this.state.medrese_adi}</Text>
        

      </View>
      <View style={{marginLeft:width/4,flexDirection:'column'}}>
      <FontAwesome
    name="snowflake-o"
    size={60}
    color="gray"
  />
  <Text style={{fontSize:Platform.OS === 'ios' ? 18 : 13,fontFamily:'baslik1',color:'gray',marginTop:Platform.OS === 'ios' ? 5 : -5}} >{this.state.minimum_sicaklik}° / {this.state.maksimum_sicaklik}°</Text>
  </View>
    </View>

       <View style={styles.reklam1}>
            <PublisherBanner
              bannerSize="largeBanner"
              adUnitID="ca-app-pub-5888738492049923/8942694831" // Test ID, Replace with your-admob-unit-id
              testDeviceID="EMULATOR"
              onDidFailToReceiveAdWithError={this.bannerError}
              onAdMobDispatchAppEvent={this.adMobEvent} />
              </View>

  </View>} // Pass props component when show full
    animation="spring" 
  
    swipeHeight={Platform.OS === 'ios' ? 80 : 60}
    disablePressToShow={true} // Press item mini to show full
    style={{ backgroundColor: '#F2F2F2',borderTopLeftRadius:55,borderTopRightRadius:55,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,

    elevation: 24,zIndex:2000}} // style for swipe
/>

      </View>
    );

   }
    
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent:'center',
    alignItems:'center'
  },
  container1: {
    width:'100%',
    height:'100%',
    backgroundColor: 'white',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:35
  },
  header:{
    zIndex:2000,
    position:'absolute',
    top:0,
    width:'100%',
    backgroundColor:'#1da1f2',
    height:110,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 5,
    justifyContent:'center',
    alignItems: 'center',
  },
  sekil:{
    flex:1,
    position:'absolute',
    top:70,
    width:'90%',
    backgroundColor:'white',
    height:90,
    borderRadius:120,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: Platform.OS === 'ios' ? 10 : 20 },
    shadowOpacity: 0.2,
    shadowRadius: Platform.OS === 'ios' ? 2 : 10,
    elevation: Platform.OS === 'ios' ? 5 : 10,
    justifyContent:'center',
    alignItems: 'center',
    
    
  },
  footer:{
    position:'absolute',
    bottom:-50,
    width:'100%',
    backgroundColor:'#F4F4F4',
    height:110,
    borderWidth: 1,
    borderRadius: 55,
    borderColor: '#EDEDED',
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,

    elevation: 24,
    justifyContent:'center',
    alignItems: 'center',
  },
  reklam:{
   marginTop:Platform.OS === 'ios' ? 40 : 20,
    width:'95%',
    backgroundColor:'white',
    borderWidth: 1,
    height:120,
    borderRadius: 10,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
    justifyContent:'center',
    alignItems: 'center',
  },

  reklam1:{
    marginTop:Platform.OS === 'ios' ? 40 : 20,

     width:'95%',
     backgroundColor:'white',
     borderWidth: 1,
     height:120,
     borderRadius: 10,
     borderColor: '#ddd',
     borderBottomWidth: 0,
     shadowColor: '#000',
     shadowOffset: { width: 6, height: 10 },
     shadowOpacity: 0.1,
     shadowRadius: 2,
     elevation: 5,
     justifyContent:'center',
     alignItems: 'center',
   },
 
  
});
