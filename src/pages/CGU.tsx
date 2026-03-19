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
            <li><strong>Compte :</strong> espace personnel créé par l'Utilisateur (email, mot de passe, profil).</li>
            <li><strong>Offre BASIC :</strong> accès gratuit au Service avec limitation à 3 sources.</li>
            <li><strong>Offre PREMIUM :</strong> abonnement payant donnant accès à l'ensemble des sources.</li>
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
          </ul>
          <p>DAKA News est un agrégateur ; il n'est pas éditeur des contenus tiers. Les contenus (titres, articles) restent la propriété exclusive des médias sources.</p>
        </section>

        <section>
          <h2>3. ACCÈS ET CRÉATION DE COMPTE</h2>
          <h3>3.1. Conditions d'accès</h3>
          <ul>
            <li>L'accès au Service nécessite la création d'un Compte (email, mot de passe, username)</li>
            <li>L'Utilisateur s'engage à fournir des informations sincères et à jour</li>
          </ul>
          
          <h3>3.2. Sécurité</h3>
          <p>Vous êtes responsable de la confidentialité de vos identifiants. En cas d'usage frauduleux, signalez-le immédiatement à dakanewsapp@gmail.com.</p>
        </section>

        <section>
          <h2>4. ABONNEMENTS & PAIEMENTS</h2>
          <h3>4.1. Offres</h3>
          <ul>
            <li><strong>Offre BASIC :</strong> gratuite, accès limité à 3 sources</li>
            <li><strong>Offre PREMIUM :</strong> 1,99 € / mois, accès à plus de 20 sources</li>
          </ul>

          <h3>4.2. Modalités de paiement</h3>
          <p>Paiement via Apple In-App Purchase (iOS) ou Google Play Billing (Android). Les abonnements sont gérés par Apple/Google conformément à leurs conditions.</p>

          <h3>4.3. Renouvellement</h3>
          <p>Les abonnements Premium se renouvellent automatiquement chaque mois jusqu'à résiliation.</p>

          <h3>4.4. Résiliation</h3>
          <p>L'Utilisateur peut annuler son abonnement à tout moment via les réglages de son compte Apple/Google. L'accès Premium demeure valable jusqu'à la fin de la période déjà payée.</p>

          <h3>4.5. Remboursement</h3>
          <p>Aucun remboursement prorata pour une période mensuelle entamée, sauf obligations légales impératives.</p>
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
