import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Login', () => {
    it('should login and store token and user', (done) => {
      const mockResponse = {
        token: 'test-token-123',
        userDto: {
          id: '1',
          email: 'test@example.com',
          nom: 'Test',
          role: 'USER'
        }
      };

      service.login('test@example.com', 'password').subscribe(() => {
        expect(localStorage.getItem('token')).toBe('test-token-123');
        expect(localStorage.getItem('role')).toBe('USER');
        const user = JSON.parse(localStorage.getItem('utilisateur') || '{}');
        expect(user.email).toBe('test@example.com');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/user/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should update estConnecte$ observable on login', (done) => {
      const mockResponse = {
        token: 'test-token-123',
        userDto: {
          id: '1',
          email: 'test@example.com',
          nom: 'Test',
          role: 'USER'
        }
      };

      service.estConnecte$.subscribe(isConnected => {
        if (isConnected) {
          expect(isConnected).toBe(true);
          done();
        }
      });

      service.login('test@example.com', 'password').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/user/login`);
      req.flush(mockResponse);
    });
  });

  describe('Logout', () => {
    it('should clear localStorage on logout', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('utilisateur', 'test-user');
      localStorage.setItem('role', 'ADMIN');

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('utilisateur')).toBeNull();
      expect(localStorage.getItem('role')).toBeNull();
    });

    it('should update estConnecte$ to false on logout', (done) => {
      service.logout();

      service.estConnecte$.subscribe(isConnected => {
        expect(isConnected).toBe(false);
        done();
      });
    });
  });

  describe('Get User Info', () => {
    it('should return user from localStorage', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        nom: 'Test User'
      };
      localStorage.setItem('utilisateur', JSON.stringify(mockUser));

      const user = service.getUtilisateur();
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null if no user in localStorage', () => {
      const user = service.getUtilisateur();
      expect(user).toBeNull();
    });

    it('should get utilisateur ID', () => {
      const mockUser = { id: '123', email: 'test@example.com', nom: 'Test' };
      localStorage.setItem('utilisateur', JSON.stringify(mockUser));

      const id = service.getUtilisateurId();
      expect(id).toBe('123');
    });

    it('should get utilisateur Nom', () => {
      const mockUser = { id: '123', email: 'test@example.com', nom: 'John Doe' };
      localStorage.setItem('utilisateur', JSON.stringify(mockUser));

      const nom = service.getNomUtilisateur();
      expect(nom).toBe('John Doe');
    });
  });

  describe('Initialization', () => {
    it('should load user from localStorage on init', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        nom: 'Test User'
      };
      localStorage.setItem('utilisateur', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token');

      const newService = new AuthService(TestBed.inject(HttpClientTestingModule as any));
      expect(newService.estConnecte()).toBe(true);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('utilisateur', 'invalid-json');
      localStorage.setItem('token', 'test-token');

      expect(() => {
        new AuthService(TestBed.inject(HttpClientTestingModule as any));
      }).not.toThrow();
    });
  });

  describe('Connect', () => {
    it('should connect user and store credentials', (done) => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        nom: 'Test User',
        role: 'USER'
      };

      service.connecter(mockUser, 'test-token-123');

      service.estConnecte$.subscribe(isConnected => {
        if (isConnected) {
          expect(localStorage.getItem('token')).toBe('test-token-123');
          expect(JSON.parse(localStorage.getItem('utilisateur') || '{}')).toEqual(mockUser);
          done();
        }
      });
    });
  });
});
