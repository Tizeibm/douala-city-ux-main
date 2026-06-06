import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, AfterViewInit, Inject, PLATFORM_ID, OnChanges } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements AfterViewInit, OnChanges {

  @Input() locations: { latitude: number; longitude: number; quartier?: string }[] = [];
  @Output() locationSelected = new EventEmitter<{ latitude: number; longitude: number }>(); // ✅ Typage précis

  isBrowser: boolean;
  private map!: L.Map;
  private markers: L.Marker[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngAfterViewInit() {
    if (this.isBrowser) {
      await this.initMap();
    }
  }

  async ngOnChanges() {
    if (this.map) {
      const L = await import('leaflet');
      this.refreshMarkers(L);
    }
  }

  private async initMap(): Promise<void> {
    const L: typeof import('leaflet') = await import('leaflet');

    this.map = L.map('map').setView([4.05, 9.7], 13); // 🗺️ Centre initial sur Douala

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // 🖱️ Écouter les clics sur la carte
    this.map.on('click', (event: L.LeafletMouseEvent) => {
      const coords = {
        latitude: event.latlng.lat,
        longitude: event.latlng.lng
      };

      this.addMarker(L, coords);
      this.locationSelected.emit(coords); // ✅ Émet vers le parent
    });

    this.refreshMarkers(L);
  }

  private refreshMarkers(L: typeof import('leaflet')): void {
    this.markers.forEach(m => m.remove());
    this.markers = [];

    this.locations.forEach(loc => {
      if (loc.latitude && loc.longitude) {
        const marker = L.marker([loc.latitude, loc.longitude]).addTo(this.map);
        marker.bindPopup(`<b>${loc.quartier || 'Localisation'}</b>`);
        this.markers.push(marker);
      }
    });
  }

  private addMarker(L: typeof import('leaflet'), coords: { latitude: number; longitude: number }): void {
    const marker = L.marker([coords.latitude, coords.longitude]).addTo(this.map);
    this.markers.push(marker);
  }
}
