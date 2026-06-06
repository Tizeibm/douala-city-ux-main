import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EntrepriseService } from './entreprises.service';
import { environment } from '../../../environments/environment';
import { Entreprise } from '../../shared/models/entreprise';

describe('EntrepriseService', () => {
  let service: EntrepriseService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/structures`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EntrepriseService]
    });
    service = TestBed.inject(EntrepriseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Entreprises CRUD', () => {
    it('should get mes entreprises', () => {
      const mockEnreprises: Entreprise[] = [
        { id: '1', nom: 'Entreprise 1', status: 'VALIDE' } as Entreprise,
        { id: '2', nom: 'Entreprise 2', status: 'EN_ATTENTE' } as Entreprise
      ];

      service.getMesEntreprises().subscribe(data => {
        expect(data.length).toBe(2);
        expect(data[0].nom).toBe('Entreprise 1');
      });

      const req = httpMock.expectOne(`${apiUrl}/mesStrucuture`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEnreprises);
    });

    it('should get entreprises validees', () => {
      const mockEntreprises: Entreprise[] = [
        { id: '1', nom: 'Entreprise 1', status: 'VALIDE' } as Entreprise
      ];

      service.getMesEntreprisesValides().subscribe(data => {
        expect(data[0].status).toBe('VALIDE');
      });

      const req = httpMock.expectOne(`${apiUrl}/mesStructuresValide`);
      req.flush(mockEntreprises);
    });

    it('should get all entreprises with pagination', () => {
      const mockResponse = {
        content: [{ id: '1', nom: 'Entreprise 1' }],
        totalPages: 1,
        totalElements: 1,
        size: 10,
        number: 0
      };

      service.getStructures(0, 10).subscribe(data => {
        expect(data.content.length).toBe(1);
        expect(data.totalPages).toBe(1);
      });

      const req = httpMock.expectOne(req => req.url.includes(`${apiUrl}/public`));
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should create entreprise', () => {
      const newEntreprise: Partial<Entreprise> = {
        nom: 'New Entreprise',
        status: 'EN_ATTENTE'
      };

      service.ajouterEntreprise(newEntreprise as Entreprise).subscribe(data => {
        expect(data.nom).toBe('New Entreprise');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush({ id: '3', ...newEntreprise });
    });

    it('should update entreprise', () => {
      const updateData: Partial<Entreprise> = { nom: 'Updated Name' };

      service.updateStructure(updateData, 'token', '1').subscribe(data => {
        expect(data.nom).toBe('Updated Name');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ id: '1', ...updateData });
    });

    it('should delete entreprise', () => {
      service.deleteStructure('1').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Admin Operations', () => {
    it('should validate entreprise', () => {
      service.validerEntreprise('1').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/valider/1`);
      expect(req.request.method).toBe('PATCH');
      req.flush({});
    });

    it('should reject entreprise', () => {
      service.rejeterEntreprise('1').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/rejeter/1`);
      expect(req.request.method).toBe('PATCH');
      req.flush({});
    });

    it('should get enterprises en attente', () => {
      const mockData = { content: [], totalPages: 0 };

      service.getEntreprisesEnAttente(0, 10).subscribe(data => {
        expect(data.content).toEqual([]);
      });

      const req = httpMock.expectOne(req => req.url.includes('/status'));
      req.flush(mockData);
    });
  });

  describe('BehaviorSubjects', () => {
    it('should set and get entreprises', (done) => {
      const mockEnreprises: Entreprise[] = [
        { id: '1', nom: 'Test' } as Entreprise
      ];

      service.setEntreprises(mockEnreprises);

      service.ent$.subscribe(data => {
        expect(data.length).toBe(1);
        done();
      });
    });

    it('should set and get page', (done) => {
      service.setPage(3);

      service.page$.subscribe(page => {
        expect(page).toBe(3);
        done();
      });
    });
  });

  describe('Search', () => {
    it('should search entreprises', () => {
      const mockResponse = { content: [], totalPages: 0 };

      service.searchEntreprises('test', undefined, 0, 10).subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/search'));
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });
});
