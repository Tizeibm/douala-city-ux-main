import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Inject, Input, OnChanges, Output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import type * as L from 'leaflet';


@Component({
  selector: 'app-cartes',
  standalone: false,
  templateUrl: './cartes.component.html',
  styleUrl: './cartes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartesComponent implements AfterViewInit, OnChanges  {

   @Input() locations: { latitude: number; longitude: number; quartier?: string; telephone?: string }[] = [];
    @Input() editable: boolean = false;
    @Output() locationSelected = new EventEmitter<{ latitude: number; longitude: number }>();
    @Output() locationRemoved = new EventEmitter<number>();
    @Input() mapId: string = 'map';
  
    isBrowser: boolean;
    private map!: L.Map;
    private markers: L.Marker[] = [];
    private leaflet!: typeof L;
  
    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
      this.isBrowser = isPlatformBrowser(this.platformId);
    }
  
    async ngAfterViewInit() {
      if (!this.isBrowser) return;
  
      this.leaflet = await import('leaflet');
      const L = this.leaflet;
  
      // Réinitialisation si une ancienne carte existe
      const mapContainer = document.getElementById(this.mapId);
      if (mapContainer && (mapContainer as any)._leaflet_id) {
        (mapContainer as any)._leaflet_id = null;
        mapContainer.innerHTML = '';
      }
  
      // Initialisation
      this.map = L.map(this.mapId).setView([4.05, 9.7], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);
  
      // Marqueurs existants
      this.refreshMarkers();
  
      // 👉 Clique sur la carte : ajoute / met à jour un point
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        this.locationSelected.emit({ latitude: lat, longitude: lng });
  
        if (this.editable) {
          // Nettoyer les anciens marqueurs
          this.markers.forEach(m => m.remove());
          this.markers = [];
  
          // Ajouter un nouveau marqueur
          const marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
          marker.bindPopup(`Latitude: ${lat.toFixed(5)}<br>Longitude: ${lng.toFixed(5)}`).openPopup();
  
          marker.on('dragend', (ev: any) => {
            const pos = marker.getLatLng();
            this.locationSelected.emit({ latitude: pos.lat, longitude: pos.lng });
          });
  
          this.markers.push(marker);
        }
      });
    }
  
    ngOnChanges(changes: SimpleChanges) {
      if (this.isBrowser && this.map && changes['locations']) {
        this.refreshMarkers();
      }
    }
  
    private refreshMarkers() {
      if (!this.map || !this.leaflet) return;
      this.markers.forEach(m => m.remove());
      this.markers = [];
  
      const L = this.leaflet;
  
      this.locations.forEach((loc, i) => {
        if (loc.latitude && loc.longitude) {
          const marker = L.marker([loc.latitude, loc.longitude]).addTo(this.map);
          marker.bindPopup(`<b>${loc.quartier || 'Localisation'}</b>`);
          this.markers.push(marker);
        }
      });
    }
}
