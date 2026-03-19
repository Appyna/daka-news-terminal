import React from 'react';
import '../styles/legal.css';

export const CGU: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>CONDITIONS GÉNÉRALES D'UTILISATION & DE VENTE</h1>
        <p className="legal-subtitle">DAKA News</p>
        <p className="legal-date">Entrée en vigueur : 15 février 2026</p>

        <section>
          <h2>Identité de l'éditeur</h2>
          <ul>
            <li><strong>Nom commercial :</strong> DAKA News</li>
            <li><strong>Email de contact :</strong> dakanewsapp@gmail.com</li>
            <li><strong>Package iOS :</strong> com.app.dakanews</li>
            <li><strong>Package Android :</strong> app.dakanews.com</li>
          </ul>
        </section>

        <section>
          <h2>1. DÉFINITIONS</h2>
          <ul>
            <li><strong>Application / Service :</strong> DAKA News, l'application mobile et le site web permettant l'agrégation, la traduction et l'affichage de titres d'actualités issues de flux RSS publics.</li>
            <li><strong>Utilisateur / Vous :</strong> toute personne physique utilisant le Service.</li>
            <li><strong>DAKA News / Nous :</strong> l'exploitant du Service.</li>
            <li><strong>Contenu tiers :</strong> titres, extraits, articles et autres contenus fournis par des médias externes via flux RSS.</li>
          </ul>
        </section>

        <section>
          <h2>2. DESCRIPTION DU SERVICE</h2>
          <p>DAKA News propose :</p>
          <ul>
            <li>L'agrégation de titres et liens provenant de flux RSS publics (médias internationaux)</li>
            <li>La traduction automatique des titres en français via intelligence artificielle (OpenAI GPT-4)</li>
            <li>L'affichage du titre traduit et du titre original avec indication claire de la source</li>
            <li>Un lien direct vers l'article d'origine</li>
            <li>Accès gratuit et illimité à plus de 20 sources d'actualités</li>
          </ul>
          <p>DAKA News est un agrégateur ; il n'est pas éditeur des contenus tiers. Les contenus (titres, articles) restent la propriété exclusive des médias sources.</p>
        </section>

        <section>
          <h2>3. ACCÈS AU SERVICE</h2>
          <p>Le Service est entièrement gratuit et accessible sans création de compte. L'accès aux actualités se fait directement via le site web ou l'application mobile.</p>
        </section>

        <section>
          <h2>4. PUBLICITÉ</h2>
          <p>Le Service est financé par la publicité fournie par Google AdSense. Les publicités sont affichées de manière non intrusive. Pour toute question concernant les publicités, consultez les <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">Politiques publicitaires de Google</a>.</p>
        </section>

        <section>
          <h2>5. PROPRIÉTÉ INTELLECTUELLE</h2>
          <h3>5.1. Contenus tiers</h3>
          <p>Les titres et liens affichés proviennent de flux RSS publics fournis par des éditeurs tiers. DAKA News ne revendique aucun droit de propriété sur ces contenus.</p>

          <h3>5.2. Contenus DAKA News</h3>
          <p>Le code source, l'interface, le design, le logo et les traductions générées par DAKA News sont la propriété exclusive de DAKA News.</p>
        </section>

        <section>
          <h2>6. RESPONSABILITÉ</h2>
          <p>DAKA News s'efforce de fournir un service de qualité, mais ne garantit pas :</p>
          <ul>
            <li>L'exactitude à 100% des traductions automatiques</li>
            <li>La disponibilité ininterrompue du service</li>
            <li>L'exactitude des contenus tiers</li>
          </ul>
          <p>Les utilisateurs sont invités à consulter l'article original en cas de doute.</p>
        </section>

        <section>
          <h2>7. DONNÉES PERSONNELLES</h2>
          <p>Pour plus d'informations sur la collecte et le traitement de vos données personnelles, consultez notre <a href="/privacy">Politique de Confidentialité</a>.</p>
        </section>

        <section>
          <h2>8. MODIFICATIONS</h2>
          <p>DAKA News se réserve le droit de modifier ces CGU à tout moment. Les utilisateurs seront informés des modifications importantes.</p>
        </section>

        <section>
          <h2>9. CONTACT</h2>
          <p>Pour toute question concernant ces conditions :</p>
          <p><strong>Email :</strong> dakanewsapp@gmail.com</p>
        </section>

        <footer className="legal-footer">
          <p>© 2026 DAKA News. Tous droits réservés.</p>
          <p><a href="/">Retour à l'accueil</a></p>
        </footer>
      </div>
    </div>
  );
};
