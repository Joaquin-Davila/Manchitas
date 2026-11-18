import { Component } from 'react'
import type { ReactNode } from 'react'

type Props = { children: ReactNode; respaldo: ReactNode }

// Si el mapa falla (sin conexión o sin cargar el chunk), se muestra el respaldo y la lista sigue funcionando.
export default class LimiteError extends Component<Props, { fallo: boolean }> {
  state = { fallo: false }

  static getDerivedStateFromError() {
    return { fallo: true }
  }

  render() {
    return this.state.fallo ? this.props.respaldo : this.props.children
  }
}
