import React from 'react';
import '../styles/legal.css';

export const Privacy: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>POLITIQUE DE CONFIDENTIALITÉ</h1>
        <p className="legal-subtitle">DAKA News</p>
        <p className="legal-date">Dernière mise à jour : 15 février 2026</p>

        <section>
          <h2>1. INTRODUCTION</h2>
          <p>DAKA News respecte votre vie privée et s'engage à protéger vos données personnelles. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.</p>
        </section>

        <section>
          <h2>2. DONNÉES COLLECTÉES</h2>
          <h3>2.1. Données techniques</h3>
          <ul>
            <li><strong>Adresse IP :</strong> pour la sécurité et les statistiques anonymisées</li>
            <li><strong>Type d'appareil :</strong> système d'exploitation, navigateur</li>
            <li><strong>Données de navigation :</strong> pages visitées, temps passé sur le site</li>
          </ul>

          <h3>2.2. Cookies et technologies similaires</h3>
          <p>Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez les désactiver via les paramètres de votre navigateur.</p>

          <h3>2.3. Google AdSense</h3>
          <p>Nous utilisons Google AdSense pour afficher des publicités. Google peut collecter des données pour personnaliser les annonces. Consultez la <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">Politique de confidentialité de Google</a> pour plus d'informations.</p>
        </section>

        <section>
          <h2>3. UTILISATION DES DONNÉES</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul>
            <li>✅ Fournir et améliorer nos services</li>
            <li>✅ Afficher des publicités pertinentes via Google AdSense</li>
            <li>✅ Analyser l'utilisation du service (statistiques anonymisées)</li>
            <li>✅ Prévenir la fraude et garantir la sécurité</li>
            <li>✅ Respecter nos obligations légales</li>
          </ul>

          <p><strong>Nous ne vendons JAMAIS vos données à des tiers.</strong></p>
        </section>

        <section>
          <h2>4. PARTAGE DES DONNÉES</h2>
          <p>Vos données peuvent être partagées avec :</p>
          <ul>
            <li><strong>Supabase :</strong> hébergement sécurisé de la base de données (Europe)</li>
            <li><strong>Google AdSense :</strong> affichage de publicités</li>
            <li><strong>OpenAI :</strong> traduction automatique des titres (aucune donnée personnelle)</li>
          </ul>
          <p><strong>Nous ne partageons JAMAIS vos données avec :</strong></p>
          <ul>
            <li>❌ Réseaux publicitaires tiers (hors Google AdSense)</li>
            <li>❌ Courtiers de données</li>
            <li>❌ Réseaux sociaux</li>
          </ul>
        </section>

        <section>
          <h2>5. CONSERVATION DES DONNÉES</h2>
          <ul>
            <li><strong>Compte actif :</strong> conservé tant que votre compte existe</li>
            <li><strong>Historique de lecture :</strong> conservé 90 jours maximum</li>
            <li><strong>Titres traduits :</strong> supprimés automatiquement après 24 heures</li>
            <li><strong>Après suppression du compte :</strong> toutes vos données sont effacées sous 30 jours</li>
          </ul>
        </section>

        <section>
          <h2>6. VOS DROITS</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d'accès :</strong> consulter vos données</li>
            <li><strong>Droit de rectification :</strong> corriger vos données</li>
            <li><strong>Droit à l'effacement :</strong> supprimer votre compte et vos données</li>
            <li><strong>Droit d'opposition :</strong> refuser certains traitements</li>
            <li><strong>Droit à la portabilité :</strong> récupérer vos données</li>
          </ul>
          <p>Pour exercer vos droits, contactez-nous : <strong>dakanewsapp@gmail.com</strong></p>
        </section>

        <section>
          <h2>7. SÉCURITÉ</h2>
          <p>Nous mettons en œuvre des mesures de sécurité pour protéger vos données :</p>
          <ul>
            <li>✅ Chiffrement des mots de passe</li>
            <li>✅ Connexion HTTPS sécurisée</li>
            <li>✅ Hébergement sur serveurs sécurisés (Supabase - Europe)</li>
            <li>✅ Accès limité aux données par le personnel autorisé</li>
          </ul>
        </section>

        <section>
          <h2>8. COOKIES</h2>
          <p>Nous utilisons des cookies essentiels pour :</p>
          <ul>
            <li>Maintenir votre session de connexion</li>
            <li>Mémoriser vos préférences</li>
          </ul>
          <p>Nous n'utilisons PAS de cookies publicitaires ou de tracking tiers.</p>
        </section>

        <section>
          <h2>9. MODIFICATIONS</h2>
          <p>Nous pouvons modifier cette politique de confidentialité. Vous serez informé des changements importants par email ou notification dans l'app.</p>
        </section>

        <section>
          <h2>10. CONTACT</h2>
          <p>Pour toute question concernant cette politique :</p>
          <p><strong>Email :</strong> dakanewsapp@gmail.com</p>
        </section>

        <section>
          <h2>11. LIENS UTILES</h2>
          <ul>
            <li><a href="/cgu">Conditions Générales d'Utilisation</a></li>
            <li><a href="/contact">Nous contacter</a></li>
            <li><a href="/">Retour à l'accueil</a></li>
          </ul>
        </section>

        <footer className="legal-footer">
          <p>© 2026 DAKA News. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  );
};
