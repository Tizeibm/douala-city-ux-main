import { Component, AfterViewInit, Inject, PLATFORM_ID, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type * as L from 'leaflet';

@Component({
  selector: 'app-carte',
  standalone: false,
  templateUrl: './carte.component.html',
  styleUrls: ['./carte.component.scss']
})
export class CarteComponent implements AfterViewInit, OnChanges {
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

  private fixLeafletIcons(L: any) {
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    
    // Fallback to CDN if assets aren't in place, or just use standard fix
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
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
    this.fixLeafletIcons(L);
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
    const bounds = new L.LatLngBounds([]);

    this.locations.forEach((loc, i) => {
      if (loc.latitude && loc.longitude) {
        const marker = L.marker([loc.latitude, loc.longitude]).addTo(this.map);
        marker.bindPopup(`<b>${loc.quartier || 'Localisation'}</b>`);
        this.markers.push(marker);
        bounds.extend([loc.latitude, loc.longitude]);
      }
    });

    if (this.markers.length > 0) {
      if (this.markers.length === 1) {
        this.map.setView(bounds.getCenter(), 15);
      } else {
        this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    } else {
      this.map.setView([4.05, 9.7], 13);
    }
  }
}
