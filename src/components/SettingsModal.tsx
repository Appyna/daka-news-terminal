import { useState } from 'react';
import { COLORS } from '../constants';
import LegalModal from './LegalModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [showCGU, setShowCGU] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showLegal, setShowLegal] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className="relative w-full max-w-md rounded-2xl shadow-2xl border border-yellow-500/20 overflow-hidden"
        style={{ backgroundColor: COLORS.dark2 }}
      >
        {/* Header avec gradient jaune */}
        <div 
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${COLORS.accentYellow1}, ${COLORS.accentYellow2})`
          }}
        />

        <div className="p-6">
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Menu des liens */}
          <div className="space-y-2">
            <button
              onClick={() => setShowCGU(true)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: COLORS.white }}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm">Conditions Générales d'Utilisation et de Vente</span>
              </div>
            </button>

            <button
              onClick={() => setShowPrivacy(true)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: COLORS.white }}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm">Politique de Confidentialité</span>
              </div>
            </button>

            <button
              onClick={() => setShowLegal(true)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: COLORS.white }}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Mentions Légales</span>
              </div>
            </button>

            <a
              href="mailto:dakanewsapp@gmail.com"
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors block"
              style={{ color: COLORS.white }}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Nous contacter</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Modaux juridiques */}
      <LegalModal
        isOpen={showCGU}
        onClose={() => setShowCGU(false)}
        title="Conditions Générales d'Utilisation et de Vente"
        content={`CONDITIONS GÉNÉRALES D'UTILISATION (CGU) & CONDITIONS GÉNÉRALES DE VENTE (CGV)

**DAKA News**

**Entrée en vigueur :** 15 février 2026

**Identité de l'éditeur : DAKA News**
• Nom commercial : DAKA News
• Entité légale : DAKA News
• Email de contact : dakanewsapp@gmail.com
• Package iOS : com.dakanewsapp.dakanews
• Package Android : com.dakanewsapp.dakanews

> **Remarque :** ce document est un modèle de CGU/CGV fourni à titre de brouillon. Il doit être relu et validé par un avocat inscrit au barreau compétent avant publication.

═══════════════════════════════════════════

**1. DÉFINITIONS**

• **Application / Service** : DAKA News, l'application mobile et le site web permettant l'agrégation, la traduction et l'affichage de titres d'actualités issues de flux RSS publics.
• **Utilisateur / Vous** : toute personne physique utilisant le Service.
• **DAKA News / Nous** : l'exploitant du Service.
• **Contenu tiers** : titres, extraits, articles et autres contenus fournis par des médias externes via flux RSS.
• **Compte** : espace personnel créé par l'Utilisateur (email, mot de passe, profil).
• **Offre BASIC** : accès gratuit au Service avec limitation à 3 sources.
• **Offre PREMIUM** : abonnement payant donnant accès à l'ensemble des sources (voir Section 6).

═══════════════════════════════════════════

**2. OBJET**

Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les conditions dans lesquelles DAKA News fournit l'accès à son Service et les conditions d'utilisation par l'Utilisateur.

Les Conditions Générales de Vente (CGV) définissent, quant à elles, les modalités de souscription, de facturation et de résiliation des Offres payantes.

═══════════════════════════════════════════

**3. DESCRIPTION DU SERVICE**

DAKA News propose :
• l'agrégation de titres et liens provenant de flux RSS publics (médias internationaux),
• la traduction automatique des titres et très courts extraits en français via un service d'intelligence artificielle (OpenAI GPT-4),
• l'affichage du titre traduit et du titre original, ainsi que l'indication claire de la source et un lien direct vers l'article d'origine.

DAKA News est **un agrégateur** ; il n'est pas éditeur des contenus tiers. Les contenus (titres, articles) restent la propriété exclusive des médias sources.

DAKA News conserve temporairement les titres et traductions en base de données pendant une durée maximale de 24 heures, après quoi ces éléments sont automatiquement purgés.

═══════════════════════════════════════════

**4. ACCÈS ET CRÉATION DE COMPTE**

**4.1. Conditions d'accès**
• L'accès au Service nécessite la création d'un Compte (email, mot de passe, username).
• L'Utilisateur s'engage à fournir des informations sincères et à jour.

**4.2. Sécurité**
• Vous êtes responsable de la confidentialité de vos identifiants. Toute connexion réalisée avec vos identifiants est réputée effectuée par vous.
• En cas d'usage frauduleux, signalez-le immédiatement à dakanewsapp@gmail.com.

**4.3. Suspension / suppression**
• DAKA News se réserve le droit de suspendre ou supprimer un Compte en cas de violation grave des CGU (fraude, scraping de l'API, revente du service, etc.).

═══════════════════════════════════════════

**5. CONTENU ET PROPRIÉTÉ INTELLECTUELLE**

**5.1. Contenus tiers**
• Les titres et liens affichés proviennent de flux RSS publics fournis par des éditeurs tiers.
• DAKA News ne revendique aucun droit de propriété sur ces contenus.
• Toute demande de retrait ou d'exclusion d'un flux doit être adressée à dakanewsapp@gmail.com avec preuves d'identité et justification; DAKA News s'engage à traiter et, le cas échéant, à retirer le flux dans les meilleurs délais.

**5.2. Sources tierces et retrait**

DAKA News agit exclusivement en qualité d'agrégateur technique de flux RSS publics accessibles sans restriction d'accès, sans contournement de mesures techniques de protection, de paywalls ou de restrictions contractuelles imposées par les éditeurs.

            Les flux relatifs à l'actualité israélienne sont collectés via la plateforme tierce Mivzakim (https://mivzakim.net/), tandis que les flux relatifs à l'actualité française et internationale sont collectés via la plateforme tierce RSS.app (https://rss.app).

Ces plateformes agissent en tant qu'intermédiaires techniques d'agrégation de flux RSS publics, sans lien capitalistique ou contractuel avec DAKA News.

En cas de modification des conditions d'accès, de suppression d'un flux, ou de demande expresse de retrait formulée par un éditeur, une plateforme intermédiaire ou tout ayant droit légitime, DAKA News s'engage à suspendre ou supprimer sans délai indu l'accès aux flux concernés, et au plus tard dans un délai de quarante-huit (48) heures après réception de la demande.

Cette suppression pourra intervenir sans préavis et sans que la responsabilité de DAKA News ne puisse être engagée à ce titre.

**5.3. Contenus DAKA News**
• Le code source, l'interface, le design, le logo et les traductions générées par DAKA News sont la propriété exclusive de DAKA News (sauf disposition contraire). Toute reproduction non autorisée est interdite.

**5.4. Traductions automatiques — CLAUSE ESSENTIELLE**

> Les traductions sont générées automatiquement par intelligence artificielle (OpenAI GPT-4) selon un prompt éditorial prédéfini. Bien que nous utilisions un système de traduction avancé avec règles strictes de neutralité et fidélité, DAKA News ne peut garantir à 100% l'exactitude, la justesse ou l'absence de biais dans les traductions automatiques. Les utilisateurs sont invités à consulter l'article original (lien fourni) en cas de doute. DAKA News n'est pas responsable des erreurs de traduction ou d'interprétation dues à l'automatisation.

═══════════════════════════════════════════

**6. CONDITIONS COMMERCIALES — ABONNEMENTS (CGV)**

**6.1. Offres**
• **Offre BASIC** : gratuite, accès limité à 3 sources.
• **Offre PREMIUM** : 1,99 € / mois (prix indicatif), accès à l'ensemble des sources (plus de 20). Facturation automatique mensuelle.

**6.2. Modalités de paiement**
• Paiement via Stripe (web) et via Apple In-App Purchase / Google Play Billing sur mobile.
• Les abonnements Apple/Google sont gérés par Apple/Google conformément à leurs conditions.

**6.3. Renouvellement automatique**
• Les abonnements Premium se renouvellent automatiquement chaque mois jusqu'à résiliation.

**6.4. Résiliation / remboursement**
• L'Utilisateur peut annuler son abonnement à tout moment. L'accès Premium demeure valable jusqu'à la fin de la période déjà payée.
• **AUCUN REMBOURSEMENT PRORATA** pour une période mensuelle entamée (sauf obligations légales impératives ou cas exceptionnel évalué par DAKA News).

**6.5. Facturation et conservation**
• Les factures sont effectuées via Stripe ou via Apple/Google selon le cas. Les copies de factures sont conservées 10 ans.

**6.6. Prix**
• Les prix annoncés sont toutes taxes comprises. DAKA News se réserve le droit d'ajuster les tarifs, en informant préalablement les Utilisateurs.

═══════════════════════════════════════════

**7. DONNÉES PERSONNELLES & CONFIDENTIALITÉ**

Pour la politique complète, consultez la **Politique de Confidentialité** (document distinct).

Points clés :
• Données collectées : email, mot de passe (hashé), username, données d'abonnement, push tokens.
• Finalités : authentification, gestion abonnement, notifications, sécurité.
• Conservation : compte (tant qu'actif); titres/traductions (24h); logs (7 jours); factures (10 ans).
• Contact RGPD : dakanewsapp@gmail.com
• Les données ne sont **JAMAIS vendues** à des tiers.

═══════════════════════════════════════════

**8. OBLIGATIONS ET RESPONSABILITÉS**

**8.1. Responsabilité de DAKA News**
• Service fourni « en l'état ». Aucune garantie d'accessibilité continue.
• DAKA News n'est pas responsable :
  - de l'exactitude des contenus tiers
  - des propos diffamatoires des médias sources
  - des interruptions, bugs
  - des erreurs de traduction IA

**8.2. Responsabilité de l'Utilisateur**
• Ne pas contourner de paywalls, ne pas scraper l'API, ne pas revendre l'accès.

**8.3. Limitation de responsabilité**
• Responsabilité globale limitée au montant perçu sur 12 mois précédents.

═══════════════════════════════════════════

**9. PROPRIÉTÉ INTELLECTUELLE**

• Titres et contenus : propriété des éditeurs originaux.
• Traductions DAKA News : propriété de DAKA News (usage personnel et non commercial).

═══════════════════════════════════════════

**10. PROCÉDURE DE RETRAIT / DÉRÉFÉRENCEMENT**

• Demande de retrait : dakanewsapp@gmail.com avec identification, preuve, URL du flux.
• Accusé réception sous 7 jours ouvrés, réponse sous 30 jours.

═══════════════════════════════════════════

**11. MODIFICATIONS DES CGU/CGV**

• DAKA News peut modifier ces conditions. Notification par email/push pour changements majeurs (30 jours de délai).
• Poursuite d'utilisation = acceptation.

═══════════════════════════════════════════

**12. DROIT APPLICABLE ET JURIDICTION**

• Droit applicable : **loi française**.
• Juridiction : tribunaux de Paris (sauf lieu de résidence du consommateur).
• Médiation amiable préalable recommandée.

═══════════════════════════════════════════

**13. DIVERS**

• Disposition invalide : autres restent en vigueur.
• Tolérance ne vaut pas renonciation.

═══════════════════════════════════════════

**14. CONTACT**

• Contact général / RGPD / DPO : dakanewsapp@gmail.com
• Questions commerciales : dakanewsapp@gmail.com

═══════════════════════════════════════════

**ANNEXES À COMPLÉTER PAR L'AVOCAT AVANT PUBLICATION :**
• Renseignements légaux complets de l'entité
• TVA et mentions fiscales
• Mentions légales site web
• Clauses Apple/Google In-App Purchase
• Clause consommateur (droit de rétractation)`}
      />

      <LegalModal        isOpen={showLegal}
        onClose={() => setShowLegal(false)}
        title="Mentions légales"
        content={`MENTIONS LÉGALES – DAKA NEWS

Conformément aux dispositions légales applicables, les présentes Mentions légales ont pour objet d'informer les utilisateurs de l'application **DAKA News** (ci-après « l'Application ») sur l'identité de l'éditeur et les conditions d'utilisation du service.

═══════════════════════════════════════════

**1. ÉDITEUR DE L'APPLICATION**

Nom de l'application : **DAKA News**
Éditeur : DAKA News

Email de contact : dakanewsapp@gmail.com

═══════════════════════════════════════════

**2. HÉBERGEMENT**

L'Application et les données associées sont hébergées par :

Nom de l'hébergeur : Render
Site web : render.com

═══════════════════════════════════════════

**3. OBJET DE L'APPLICATION**

DAKA News est une application d'information permettant aux utilisateurs d'accéder à des **titres d'actualité issus de flux RSS publics** provenant de médias internationaux.

Les fonctionnalités principales incluent :

• Agrégation de flux RSS publics
• Traduction automatique des titres en langue française
• Affichage du titre original dans la langue source
• Redirection vers l'article original via un lien externe

DAKA News ne publie **aucun article complet** et ne modifie pas le contenu éditorial des sources.

═══════════════════════════════════════════

**4. SOURCES TIERCES ET RETRAIT**

DAKA News agit exclusivement en qualité d'agrégateur technique de flux RSS publics accessibles sans restriction d'accès, sans contournement de mesures techniques de protection, de paywalls ou de restrictions contractuelles imposées par les éditeurs.

            Les flux relatifs à l'actualité israélienne sont collectés via la plateforme tierce Mivzakim (https://mivzakim.net/), tandis que les flux relatifs à l'actualité française et internationale sont collectés via la plateforme tierce RSS.app (https://rss.app).

Ces plateformes agissent en tant qu'intermédiaires techniques d'agrégation de flux RSS publics, sans lien capitalistique ou contractuel avec DAKA News.

En cas de modification des conditions d'accès, de suppression d'un flux, ou de demande expresse de retrait formulée par un éditeur, une plateforme intermédiaire ou tout ayant droit légitime, DAKA News s'engage à suspendre ou supprimer sans délai indu l'accès aux flux concernés, et au plus tard dans un délai de quarante-huit (48) heures après réception de la demande.

Cette suppression pourra intervenir sans préavis et sans que la responsabilité de DAKA News ne puisse être engagée à ce titre.

═══════════════════════════════════════════

**5. PROPRIÉTÉ INTELLECTUELLE**

L'ensemble des éléments constituant l'Application (structure, interface, textes propres à l'Application, code, bases de données, nom DAKA News) est protégé par le droit de la propriété intellectuelle.

Les titres d'articles affichés proviennent de **flux RSS publics** appartenant à leurs éditeurs respectifs.

Les noms des médias sont mentionnés **à titre informatif uniquement**, sans reproduction de logos ni éléments graphiques protégés.

Toute reproduction, représentation ou exploitation non autorisée des éléments propres à DAKA News est interdite.

═══════════════════════════════════════════

**6. ABSENCE D'AFFILIATION**

DAKA News est une application **indépendante**.

Elle n'est affiliée, associée, sponsorisée ou approuvée par aucun des médias, éditeurs ou plateformes dont les flux RSS sont référencés dans l'Application.

═══════════════════════════════════════════

**7. RESPONSABILITÉ**

DAKA News agit en tant qu'outil technique d'agrégation et de traduction automatique.

L'éditeur ne saurait être tenu responsable :

• Du contenu éditorial publié par les médias sources
• Des erreurs éventuelles de traduction automatique
• De l'indisponibilité temporaire de certains flux RSS
• Du contenu des sites tiers accessibles via les liens externes

L'utilisateur est invité à consulter l'article original sur le site source pour toute vérification ou information complète.

═══════════════════════════════════════════

**8. DONNÉES PERSONNELLES**

Le traitement des données personnelles est décrit dans la **Politique de confidentialité** de l'Application.

═══════════════════════════════════════════

**9. DROIT APPLICABLE**

Les présentes Mentions légales sont soumises :

• Au **droit français** pour les utilisateurs situés dans l'Union européenne
• Le cas échéant, au **droit israélien** pour les utilisateurs situés en Israël

En cas de litige, la juridiction compétente sera déterminée conformément aux règles légales applicables.

═══════════════════════════════════════════

**10. CONTACT**

Pour toute question relative à l'Application ou aux présentes Mentions légales :

Email : dakanewsapp@gmail.com`}
      />

      <LegalModal        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        title="Politique de Confidentialité"
        content={`POLITIQUE DE CONFIDENTIALITÉ – DAKA NEWS

**Dernière mise à jour : 15 février 2026**

La présente Politique de confidentialité a pour objectif d'informer les utilisateurs de l'application **DAKA News** (ci‑après « l'Application ») sur la manière dont leurs données personnelles sont collectées, utilisées et protégées, conformément au **Règlement Général sur la Protection des Données (RGPD)** et, le cas échéant, à la **loi israélienne sur la protection de la vie privée (Privacy Protection Law, 1981)**.

═══════════════════════════════════════════

**1. RESPONSABLE DU TRAITEMENT**

Le responsable du traitement est :

• Nom d'entité : **DAKA News**
• Email de contact : dakanewsapp@gmail.com

═══════════════════════════════════════════

**2. DONNÉES COLLECTÉES**

DAKA News collecte uniquement les données strictement nécessaires au fonctionnement de l'Application.

**2.1 Données collectées automatiquement**

Lors de l'utilisation de l'Application, les données suivantes peuvent être collectées :

• Adresse IP (anonymisée ou partiellement anonymisée lorsque possible)
• Type d'appareil, système d'exploitation, version de l'application
• Données de navigation internes (flux consultés, fréquence d'utilisation)

Ces données sont collectées à des fins statistiques, de sécurité et d'amélioration du service.

**2.2 Données fournies par l'utilisateur**

Selon les fonctionnalités activées, l'Application peut collecter :

• Adresse email (en cas de création de compte ou de contact)
• Informations liées à l'abonnement (via Apple App Store ou Google Play)

DAKA News ne collecte **aucune donnée sensible** au sens du RGPD.

═══════════════════════════════════════════

**3. CONTENU ÉDITORIAL ET FLUX RSS**

DAKA News agrège des **flux RSS publics** provenant de médias internationaux.

• Les contenus affichés se limitent **au titre des articles** (une phrase maximum)
• Ces titres sont **traduits automatiquement** en français à l'aide d'une intelligence artificielle
• Le titre original dans la langue source peut également être affiché

Les contenus sont stockés temporairement dans une base de données interne **pour une durée maximale de 24 heures**, uniquement afin de permettre l'affichage dans l'Application.

Aucun article complet n'est reproduit ni stocké.

═══════════════════════════════════════════

**4. FINALITÉS DU TRAITEMENT**

Les données personnelles sont traitées pour les finalités suivantes :

• Fourniture et fonctionnement de l'Application
• Affichage de contenus d'actualité traduits
• Gestion des abonnements et limitations de flux
• Sécurité et prévention des abus
• Statistiques anonymes d'utilisation

═══════════════════════════════════════════

**5. BASE LÉGALE DU TRAITEMENT**

Les traitements reposent sur :

• L'exécution du contrat (fourniture du service)
• L'intérêt légitime de DAKA News (sécurité, amélioration du service)
• Le consentement de l'utilisateur lorsque requis

═══════════════════════════════════════════

**6. PARTAGE DES DONNÉES**

Les données personnelles ne sont **ni vendues ni louées**.

Elles peuvent être partagées uniquement avec :

• Prestataires techniques (hébergement, infrastructure, outils d'analyse)
• Plateformes de paiement (Apple / Google), qui agissent en tant que responsables indépendants

Aucun partenaire éditorial ou média source ne reçoit de données personnelles des utilisateurs.

═══════════════════════════════════════════

**7. TRANSFERTS INTERNATIONAUX**

Certaines données peuvent être traitées hors de l'Union européenne, notamment lorsque des prestataires techniques sont situés dans des pays tiers.

Dans ce cas, DAKA News s'assure que des garanties appropriées sont en place (clauses contractuelles types, mesures de sécurité renforcées).

═══════════════════════════════════════════

**8. DURÉE DE CONSERVATION**

• Données de contenus (titres RSS traduits) : **24 heures maximum**
• Données de compte : durée de l'utilisation du service
• Données techniques et statistiques : durée limitée et proportionnée

═══════════════════════════════════════════

**9. SÉCURITÉ**

DAKA News met en œuvre des mesures techniques et organisationnelles appropriées afin de garantir la sécurité des données personnelles et d'empêcher tout accès non autorisé, perte ou divulgation.

═══════════════════════════════════════════

**10. DROITS DES UTILISATEURS**

Conformément au RGPD, les utilisateurs disposent des droits suivants :

• Droit d'accès
• Droit de rectification
• Droit à l'effacement
• Droit à la limitation du traitement
• Droit d'opposition
• Droit à la portabilité des données

Les demandes peuvent être adressées à : dakanewsapp@gmail.com

Les utilisateurs disposent également du droit d'introduire une réclamation auprès de l'autorité de contrôle compétente.

═══════════════════════════════════════════

**11. UTILISATEURS ISRAÉLIENS**

Pour les utilisateurs situés en Israël, les traitements sont également conformes à la **Privacy Protection Law, 1981**, et aux règlements applicables.

═══════════════════════════════════════════

**12. MODIFICATION DE LA POLITIQUE**

DAKA News se réserve le droit de modifier la présente Politique de confidentialité à tout moment.

Les utilisateurs seront informés de toute modification substantielle via l'Application.

═══════════════════════════════════════════

**13. CONTACT**

Pour toute question relative à la présente Politique de confidentialité :

• Email : dakanewsapp@gmail.com

**DAKA News n'est affilié à aucun des médias cités.**`}
      />
    </div>
  );
}
