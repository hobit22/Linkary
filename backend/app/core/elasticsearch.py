"""Elasticsearch client and configuration."""

from typing import Optional
from elasticsearch import AsyncElasticsearch
from app.core.config import get_settings

# Global Elasticsearch client instance
_es_client: Optional[AsyncElasticsearch] = None


def get_elasticsearch() -> AsyncElasticsearch:
    """
    Get the Elasticsearch client instance.

    Returns:
        AsyncElasticsearch client instance

    Raises:
        RuntimeError: If Elasticsearch client is not initialized
    """
    if _es_client is None:
        raise RuntimeError("Elasticsearch client not initialized. Call init_elasticsearch() first.")
    return _es_client


async def init_elasticsearch() -> None:
    """
    Initialize the Elasticsearch client connection.

    Creates a global AsyncElasticsearch client instance.
    Should be called during application startup.
    """
    global _es_client
    settings = get_settings()

    _es_client = AsyncElasticsearch(
        [settings.ELASTICSEARCH_URL],
        request_timeout=30,
        max_retries=3,
        retry_on_timeout=True,
    )

    # Test connection
    try:
        info = await _es_client.info()
        print(f"✓ Connected to Elasticsearch: {info['version']['number']}")
    except Exception as e:
        print(f"✗ Failed to connect to Elasticsearch: {e}")
        # Don't raise - allow app to start even if Elasticsearch is down
        # Search will fall back to MongoDB if Elasticsearch is unavailable


async def close_elasticsearch() -> None:
    """
    Close the Elasticsearch client connection.

    Should be called during application shutdown.
    """
    global _es_client
    if _es_client is not None:
        await _es_client.close()
        _es_client = None
        print("✓ Elasticsearch connection closed")


async def create_index_with_nori() -> None:
    """
    Create Elasticsearch index with Korean nori analyzer configuration.

    Sets up custom analyzers optimized for Korean text search:
    - korean_analyzer: For indexing and searching Korean text
    - Uses nori_tokenizer with mixed decompound mode
    - Removes particles (조사) and endings (어미) using nori_part_of_speech filter
    - Applies lowercase filter for case-insensitive search
    """
    settings = get_settings()
    es = get_elasticsearch()
    index_name = settings.ELASTICSEARCH_INDEX

    # Check if index already exists
    exists = await es.indices.exists(index=index_name)
    if exists:
        print(f"✓ Index '{index_name}' already exists")
        return

    # Index configuration with nori analyzer
    index_config = {
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 0,
            "analysis": {
                "tokenizer": {
                    "nori_tokenizer": {
                        "type": "nori_tokenizer",
                        "decompound_mode": "mixed",  # Splits compound nouns
                        "discard_punctuation": True,
                    }
                },
                "filter": {
                    "nori_posfilter": {
                        "type": "nori_part_of_speech",
                        "stoptags": [
                            "E",   # 어미 (verbal endings)
                            "IC",  # 감탄사 (interjections)
                            "J",   # 조사 (particles)
                            "MAG", # 일반 부사 (general adverbs)
                            "MM",  # 관형사 (determiners)
                            "SP",  # 공백 (spaces)
                            "SSC", # 닫는 괄호 (closing brackets)
                            "SSO", # 여는 괄호 (opening brackets)
                            "SC",  # 구분자 (separators)
                            "SE",  # 줄임표 (ellipsis)
                            "XPN", # 접두사 (prefixes)
                            "XSA", # 형용사 파생 접미사 (adjective-deriving suffixes)
                            "XSN", # 명사 파생 접미사 (noun-deriving suffixes)
                            "XSV", # 동사 파생 접미사 (verb-deriving suffixes)
                            "UNA", # 분석 불능 (unknown)
                            "NA",  # 분석 불능 (unknown)
                            "VSV", # 동사 (verbs)
                        ],
                    },
                    "english_stop": {
                        "type": "stop",
                        "stopwords": "_english_",
                    },
                },
                "analyzer": {
                    "korean_analyzer": {
                        "type": "custom",
                        "tokenizer": "nori_tokenizer",
                        "filter": [
                            "nori_posfilter",
                            "lowercase",
                            "nori_readingform",  # Converts hanja to hangul
                        ],
                    },
                    "english_analyzer": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": [
                            "lowercase",
                            "english_stop",
                        ],
                    },
                },
            },
        },
        "mappings": {
            "properties": {
                "link_id": {
                    "type": "keyword",
                },
                "user_id": {
                    "type": "keyword",
                },
                "url": {
                    "type": "keyword",
                },
                "title": {
                    "type": "text",
                    "analyzer": "korean_analyzer",
                    "fields": {
                        "keyword": {"type": "keyword"},
                        "english": {
                            "type": "text",
                            "analyzer": "english_analyzer",
                        },
                    },
                },
                "description": {
                    "type": "text",
                    "analyzer": "korean_analyzer",
                    "fields": {
                        "english": {
                            "type": "text",
                            "analyzer": "english_analyzer",
                        },
                    },
                },
                "notes": {
                    "type": "text",
                    "analyzer": "korean_analyzer",
                    "fields": {
                        "english": {
                            "type": "text",
                            "analyzer": "english_analyzer",
                        },
                    },
                },
                "tags": {
                    "type": "keyword",
                },
                "category": {
                    "type": "keyword",
                },
                "created_at": {
                    "type": "date",
                },
                "updated_at": {
                    "type": "date",
                },
            }
        },
    }

    # Create the index
    await es.indices.create(index=index_name, body=index_config)
    print(f"✓ Created index '{index_name}' with nori analyzer")
