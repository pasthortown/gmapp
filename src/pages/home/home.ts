import { Geolocation } from '@ionic-native/geolocation';
import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { } from '@types/googlemaps';
import { WebIntent } from '@ionic-native/web-intent';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  miPosicion: google.maps.LatLng;
  miMarcador: google.maps.Marker;
  MarcadorDestino: google.maps.Marker;
  activado: Boolean;

  constructor(public navCtrl: NavController, private webIntent: WebIntent, private geolocation: Geolocation) {

  }

  ngOnInit() {
    this.startGoogleMap();
  }

  startGoogleMap() {
    const mapProp = {
        center: new google.maps.LatLng(-0.224710, -78.516763),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    this.iniciarMarcadores();
  }

  iniciarMarcadores() {
    this.MarcadorDestino = new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      map: this.map,
      draggable: true
    });
    let destino = this.MarcadorDestino;
    this.map.addListener('click', function(event) {
      destino.setPosition(event.latLng);
    });
    this.miMarcador = new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      map: this.map,
      draggable: false
    });
    this.obtenerMiPosicion();
  }

  obtenerMiPosicion() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.miPosicion = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      this.actualizarMarcadorMio();
     }).catch((error) => {
       console.log(error);
     });
  }

  escucharGPS(){
    this.escuchando();
    if ( this.activado) {
        setTimeout(() => {
        this.escucharGPS();
        }, 15000);
    }
  }

  escuchando() {
    this.obtenerMiPosicion();
  }

  actualizarMarcadorMio() {
    this.miMarcador.setPosition(this.miPosicion);
  }

  getRoute() {
    let directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(this.map);
    let directionsService = new google.maps.DirectionsService();
    let request: google.maps.DirectionsRequest = {
      origin: this.miMarcador.getPosition(),
      destination: this.MarcadorDestino.getPosition(),
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: google.maps.TrafficModel.PESSIMISTIC
      },
    };
    directionsService.route(request, function(result, status) {
      directionsDisplay.setDirections(result);
    })
  }

  irAlDestino() {
    let destino = this.miPosicion.lat + ',' + this.miPosicion.lng;
    const options = {
      action: this.webIntent.ACTION_VIEW,
      url: 'geo:' + destino
    };
    this.webIntent.startActivity(options)
    .then(r1 => {
    }, error => {
      console.log(error);
    });
  }

  activar() {
    this.escucharGPS();
  }
}
