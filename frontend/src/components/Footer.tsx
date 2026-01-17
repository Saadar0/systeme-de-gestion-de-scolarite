import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGraduationCap } from 'react-icons/fa'

function Footer() {
  return (
    <footer className="py-12 mt-auto" style={{ backgroundColor: '#1A1D29' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* University Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#3D3F4A' }}>
                <FaGraduationCap className="text-lg text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">EnsaB Berrechid</h3>
            </div>
            <p className="leading-relaxed" style={{ color: '#B1B2B5' }}>
              École Nationale des Sciences Appliquées de Berrechid (EnsaB) est une institution d'enseignement supérieur spécialisée dans les sciences appliquées, offrant des programmes d'ingénierie de qualité.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold" style={{ color: '#B1B2B5' }}>Contactez-nous</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-x-3">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0" style={{ color: '#7D8491' }} />
                <div style={{ color: '#B1B2B5' }}>
                  <p>Avenue de l'université, B.P :218 Berrechid.</p>
                  <p>Berrechid, Maroc</p>
                </div>
              </div>
              <div className="flex items-center gap-x-3">
                <FaPhone className="flex-shrink-0" style={{ color: '#7D8491' }} />
                <span style={{ color: '#B1B2B5' }}>+212 123 45 67 89</span>
              </div>
              <div className="flex items-center gap-x-3">
                <FaEnvelope className="flex-shrink-0" style={{ color: '#7D8491' }} />
                <span style={{ color: '#B1B2B5' }}>contact@ensab.ma</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold" style={{ color: '#B1B2B5' }}>Liens rapides</h4>
            <div className="grid grid-cols-1 gap-2">
              <a href="#" className="transition-colors duration-300 hover:opacity-80" style={{ color: '#B1B2B5' }}>À propos</a>
              <a href="#" className="transition-colors duration-300 hover:opacity-80" style={{ color: '#B1B2B5' }}>Programmes</a>
              <a href="#" className="transition-colors duration-300 hover:opacity-80" style={{ color: '#B1B2B5' }}>Admissions</a>
              <a href="#" className="transition-colors duration-300 hover:opacity-80" style={{ color: '#B1B2B5' }}>Contact</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t" style={{ borderColor: '#7D8491' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: '#7D8491' }}>
              © 2024 EnsaB Berrechid. Tous droits réservés.
            </p>
            <div className="flex gap-x-6">
              <a href="#" className="text-sm transition-colors duration-300 hover:opacity-80" style={{ color: '#7D8491' }}>Politique de confidentialité</a>
              <a href="#" className="text-sm transition-colors duration-300 hover:opacity-80" style={{ color: '#7D8491' }}>Conditions d'utilisation</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
