
# Importaciones necesarias de las librerías
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from enum import Enum
from extensions import db # Importa la instancia 'db' desde extensions.py

class TipoPerfil(Enum):
    EMPRESARIO = "empresario"
    EMPRENDEDOR = "emprendedor"
    INVERSIONISTA = "inversionista"
    INSTITUCION = "institucion"
    ADMIN = "admin"


class Usuario(db.Model):
    """Modelo que representa a un usuario genérico en el sistema."""
    __tablename__ = 'usuarios' # Nombre explícito de la tabla en la BD.

   
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    tipo_perfil = db.Column(db.Enum(TipoPerfil, native_enum=False), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False, server_default='false')
    activo = db.Column(db.Boolean, default=True)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    ultima_conexion = db.Column(db.DateTime)

    
    empresario = db.relationship('Empresario', backref='usuario', uselist=False, cascade='all, delete-orphan')
    emprendedor = db.relationship('Emprendedor', backref='usuario', uselist=False, cascade='all, delete-orphan')
    inversionista = db.relationship('Inversionista', backref='usuario', uselist=False, cascade='all, delete-orphan')
    institucion = db.relationship('Institucion', backref='usuario', uselist=False, cascade='all, delete-orphan')

    # --- Métodos de Ayuda (Helpers) ---

    def set_password(self, password):
        """Toma una contraseña en texto plano y la guarda como un hash seguro."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Toma una contraseña en texto plano y la compara con el hash guardado."""
        return check_password_hash(self.password_hash, password)

    def get_perfil(self):
        """Método útil para obtener el objeto del perfil específico del usuario."""
        if self.tipo_perfil == TipoPerfil.EMPRESARIO:
            return self.empresario
        elif self.tipo_perfil == TipoPerfil.EMPRENDEDOR:
            return self.emprendedor
        elif self.tipo_perfil == TipoPerfil.INVERSIONISTA:
            return self.inversionista
        elif self.tipo_perfil == TipoPerfil.INSTITUCION:
            return self.institucion
        elif self.tipo_perfil == TipoPerfil.ADMIN:
            # Un admin no tiene un perfil detallado, devolvemos un objeto simple.
            return type('AdminProfile', (), {'nombre_completo': 'Administrador'})()
        return None

    def __repr__(self):
        """Representación en string del objeto, útil para debugging."""
        return f'<Usuario {self.email} - {self.tipo_perfil.value}>'

# Paso 4: Crear los Modelos Específicos para cada Perfil
# Ahora, crearías las clases para cada tipo de perfil. Estas clases contendrán los
# campos que son únicos para cada rol. Cada uno tiene una llave foránea 'usuario_id'
# que lo vincula de forma única a un registro en la tabla 'usuarios'.

class Emprendedor (db.Model):
    """Modelo que representa a un emprendedor."""
    __tablename__ = 'emprendedores'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id', ondelete='CASCADE'), unique=True, nullable=False)

    # Campos del formulario de registro
    nombre_completo = db.Column(db.String(150), nullable=False)
    tipo_documento = db.Column(db.String(10), nullable=False)
    numero_documento = db.Column(db.String(30), unique=True, nullable=False)
    numero_celular = db.Column(db.String(15), nullable=False)
    programa_formacion = db.Column(db.String(150), nullable=False)
    titulo_proyecto = db.Column(db.String(150), nullable=False)
    descripcion_proyecto = db.Column(db.Text, nullable=False)
    relacion_sector = db.Column(db.String(250), nullable=False)
    tipo_apoyo = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return f'<Emprendedor {self.nombre_completo}>'



class Empresario(db.Model):
    """Modelo que representa a un empresario."""
    __tablename__ = 'empresarios'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id', ondelete='CASCADE'), unique=True, nullable=False)
    
    # Campos del formulario de registro
    nombre_completo = db.Column(db.String(150), nullable=False)
    tipo_documento_personal = db.Column(db.String(10), nullable=False)
    numero_documento_personal = db.Column(db.String(30), unique=True, nullable=False)
    numero_celular = db.Column(db.String(15), nullable=False)
    nombre_empresa = db.Column(db.String(150), nullable=False)
    tipo_contribuyente = db.Column(db.String(20), nullable=False)
    numero_documento_contribuyente = db.Column(db.String(30), unique=True, nullable=True) # Para Persona Natural
    nit = db.Column(db.String(30), unique=True, nullable=True) # Para Persona Jurídica
    tamano = db.Column(db.String(20), nullable=False)
    sector_produccion = db.Column(db.String(100), nullable=False)
    sector_transformacion = db.Column(db.String(100), nullable=False)
    sector_comercializacion = db.Column(db.String(100), nullable=False)


    def __repr__(self):
        return f'<Empresario {self.nombre_empresa}>'

class Inversionista(db.Model):
    """Modelo que representa a un inversionista."""
    __tablename__ = 'inversionistas'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id', ondelete='CASCADE'), unique=True, nullable=False)
    # Campos del formulario de registro
    nombre_completo = db.Column(db.String(150), nullable=False)
    tipo_documento = db.Column(db.String(10), nullable=False)
    numero_documento = db.Column(db.String(30), unique=True, nullable=False)
    numero_celular = db.Column(db.String(15), nullable=False)
    nombre_fondo = db.Column(db.String(150)) # Puede ser opcional
    tipo_inversion = db.Column(db.String(50), nullable=False)
    # Para los checkboxes, guardaremos una lista de strings separada por comas.
    etapas_interes = db.Column(db.String(255))
    areas_interes = db.Column(db.String(255))

class Institucion(db.Model):
    """Modelo que representa a una institución."""
    __tablename__ = 'instituciones'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id', ondelete='CASCADE'), unique=True, nullable=False)
    # Campos del formulario de registro
    nombre_completo = db.Column(db.String(150), nullable=False)
    nit = db.Column(db.String(30), unique=True, nullable=False)
    tipo_institucion = db.Column(db.String(50), nullable=False)
    municipio = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    area_especializacion = db.Column(db.String(100), nullable=False)
    # Para los checkboxes, guardaremos una lista de strings separada por comas.
    participacion_activa = db.Column(db.String(255))

    def __repr__(self):
        return f'<Institucion {self.nombre_institucion}>'
