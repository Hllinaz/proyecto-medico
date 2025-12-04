import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Singleton en toda la app
})
export class ComunicacionService<T> {
  // BehaviorSubject mantiene el último valor emitido
  private mensajeSource = new BehaviorSubject<T | null>(null);

  // Observable al que los componentes se suscriben
  mensajeActual$ = this.mensajeSource.asObservable();

  // Método para enviar mensajes
  enviarMensaje(mensaje: T): void {
    this.mensajeSource.next(mensaje);
  }

  // Obtener valor actual
  obtenerMensajeActual(): T | null {
    return this.mensajeSource.getValue();
  }
}
