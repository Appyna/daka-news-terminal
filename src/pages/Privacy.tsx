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
          <h3>2.1. Données d'inscription</h3>
          <ul>
            <li><strong>Email :</strong> pour créer et gérer votre compte</li>
            <li><strong>Nom d'utilisateur :</strong> pour personnaliser votre expérience</li>
            <li><strong>Mot de passe :</strong> chiffré pour sécuriser votre compte</li>
          </ul>

          <h3>2.2. Données d'utilisation</h3>
          <ul>
            <li><strong>Historique de lecture :</strong> articles consultés pour améliorer les recommandations</li>
            <li><strong>Préférences :</strong> sources favorites, paramètres d'affichage</li>
            <li><strong>Données techniques :</strong> type d'appareil, système d'exploitation, version de l'app</li>
          </ul>

          <h3>2.3. Données de localisation</h3>
          <p>Nous collectons votre <strong>localisation approximative</strong> (pays/région) pour :</p>
          <ul>
            <li>Afficher les actualités pertinentes pour votre région</li>
            <li>Adapter le contenu à votre langue</li>
            <li>Respecter les obligations légales locales</li>
          </ul>
          <p><strong>Nous ne collectons JAMAIS votre position GPS précise.</strong></p>

          <h3>2.4. Données d'abonnement</h3>
          <ul>
            <li><strong>Statut Premium :</strong> pour gérer votre accès aux fonctionnalités payantes</li>
            <li><strong>Historique de paiement :</strong> géré par Apple/Google, nous ne stockons pas vos informations bancaires</li>
          </ul>
        </section>

        <section>
          <h2>3. UTILISATION DES DONNÉES</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul>
            <li>✅ Fournir et améliorer nos services</li>
            <li>✅ Gérer votre compte et votre abonnement</li>
            <li>✅ Personnaliser votre expérience</li>
            <li>✅ Envoyer des notifications importantes</li>
            <li>✅ Prévenir la fraude et garantir la sécurité</li>
            <li>✅ Respecter nos obligations légales</li>
          </ul>

          <h3>3.1. Suivi (Tracking)</h3>
          <p>Nous utilisons <strong>RevenueCat</strong> pour gérer les abonnements cross-platform. Ce service peut collecter :</p>
          <ul>
            <li>Identifiant utilisateur anonymisé</li>
            <li>Données d'abonnement</li>
            <li>Informations d'appareil</li>
          </ul>
          <p><strong>Ces données sont utilisées UNIQUEMENT pour :</strong></p>
          <ul>
            <li>Gérer les abonnements entre iOS et Android</li>
            <li>Prévenir la fraude sur les achats</li>
            <li>Analyser les performances des offres</li>
          </ul>
          <p><strong>Nous ne vendons JAMAIS vos données à des tiers.</strong></p>
        </section>

        <section>
          <h2>4. PARTAGE DES DONNÉES</h2>
          <p>Vos données peuvent être partagées avec :</p>
          <ul>
            <li><strong>Supabase :</strong> hébergement sécurisé de la base de données (Europe)</li>
            <li><strong>RevenueCat :</strong> gestion des abonnements</li>
            <li><strong>Apple/Google :</strong> traitement des paiements</li>
            <li><strong>OpenAI :</strong> traduction automatique des titres (aucune donnée personnelle)</li>
          </ul>
          <p><strong>Nous ne partageons JAMAIS vos données avec :</strong></p>
          <ul>
            <li>❌ Réseaux publicitaires</li>
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
