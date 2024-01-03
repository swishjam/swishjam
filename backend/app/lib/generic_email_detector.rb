class GenericEmailDetector
  GENERIC_EMAIL_DOMAINS = %w[
    aol
    fastmail
    gmx
    gmail
    hotmail
    hushmail
    icloud
    inbox
    list
    live
    mail
    outlook
    proton
    protonmail
    qq
    tutanota
    ya
    yandex
    yahoo
    zoho
  ]

  EMAILS_SUFFIXES = %w[
    com
    info
    net
    ru
    org
  ]

  GENERIC_EMAIL_PROVIDERS = GENERIC_EMAIL_DOMAINS.product(EMAILS_SUFFIXES).map { |domain, suffix| "#{domain}.#{suffix}" }

  def self.is_generic_email?(email)
    raise ArgumentError, "Provided email is blank" if email.blank?
    email_domain = email.split('@').last
    GENERIC_EMAIL_PROVIDERS.include?(email_domain.downcase)
  end
end